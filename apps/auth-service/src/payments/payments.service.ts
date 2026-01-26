import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient({
            datasources: { db: { url: process.env.DATABASE_URL } }
        });
    }

    async confirmDownPayment(merchantId: string, loanId: string, amount: number, reference?: string) {
        this.logger.log(`Processing down payment for Loan ${loanId} by Merchant ${merchantId}: ₦${amount}`);

        // 1. Fetch Loan & Related Device
        const loan = await this.prisma.loan.findUnique({
            where: { id: loanId },
            include: { device: true }
        });

        if (!loan) throw new NotFoundException('Loan not found');

        // Tenant Isolation Check
        // We check device.merchantId as it is guaranteed to exist
        if (loan.device.merchantId !== merchantId) {
            this.logger.warn(`Tenant Mismatch: Loan ${loanId} (Merchant ${loan.device.merchantId}) accessed by ${merchantId}`);
            throw new BadRequestException('Access denied: Loan belongs to another merchant');
        }

        if (loan.status === 'ACTIVE') throw new BadRequestException('Loan is already active');
        if (loan.status === 'COMPLETED') throw new BadRequestException('Loan is already completed');

        // 2. Validate Amount (Optional Risk Check)
        // For MVP, we trust the agent entered the correct Down Payment collected.
        // In real system, we'd check against a 'expectedDownPayment' field in the Loan or Metadata.

        // 3. Activate Loan & Unlock Device
        // Transaction to ensure atomicity
        return this.prisma.$transaction(async (tx) => {
            // Update Loan
            const updatedLoan = await tx.loan.update({
                where: { id: loanId },
                data: {
                    status: 'ACTIVE',
                    approvedAt: new Date(), // Replaced startDate
                }
            });

            // Update Device
            // "ACTIVE" for device usually means "In Use / Unlocked"
            // "LOCKED" means Defaulted.
            const updatedDevice = await tx.device.update({
                where: { imei: loan.deviceIMEI }, // Use IMEI from loan
                data: {
                    status: 'UNLOCKED', // Correct Enum
                    // We might want to set a 'nextLockDate' here if we had that field
                }
            });

            // Log Payment (If Payment model exists, currently verifying schema... it does NOT exist yet in Phase 1 snippet)
            // So we just log to console or create a generic ledger entry if we had one.
            this.logger.log(`Payment Confirmed. Loan ${loan.id} Active. Device ${updatedDevice.imei} Unlocked.`);

            return {
                success: true,
                message: 'Payment confirmed. Device unlocked.',
                loanStatus: updatedLoan.status,
                deviceStatus: updatedDevice.status,
                reference: reference || `CASH-${Date.now()}`
            };
        });
    }
}
