import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLoanPartnerDto, LpisCreateLoanDto, LpisWebhookDto } from './dto';
import { LoanStatus } from '@prisma/client';
import { DeviceControlService } from '../device-control/device-control.service';
import * as crypto from 'crypto';

@Injectable()
export class LoanPartnerService {
    private readonly logger = new Logger(LoanPartnerService.name);

    constructor(
        private prisma: PrismaService,
        private lockService: DeviceControlService // Injected Enforcement Logic
    ) { }

    // === ADMIN: Manage Partners ===
    async createPartner(dto: CreateLoanPartnerDto) {
        // Enforce uniqueness
        const exists = await this.prisma.loanPartner.findUnique({ where: { slug: dto.slug } });
        if (exists) throw new BadRequestException(`Loan Partner with slug ${dto.slug} already exists`);

        return this.prisma.loanPartner.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                baseUrl: dto.baseUrl,
                apiKey: dto.apiKey, // Should encrypt
                webhookSecret: dto.webhookSecret,
                minDownPaymentPct: dto.minDownPaymentPct,
                maxTenure: dto.maxTenure
            }
        });
    }

    async findAll() {
        return this.prisma.loanPartner.findMany({ where: { isActive: true } });
    }

    async findAllLoans(partnerId: string) {
        return this.prisma.loan.findMany({
            where: { loanPartnerId: partnerId },
            include: {
                device: true,
                product: true,
                merchant: {
                    select: {
                        id: true,
                        // @ts-ignore
                        merchantProfile: { select: { businessName: true } }
                    }
                },
                user: {
                    select: {
                        id: true,
                        // @ts-ignore
                        customerProfile: { select: { firstName: true, lastName: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getLoansForUser(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.loanPartnerId) {
            // If Admin, maybe return all?
            // For now, if no partner ID, return empty or throw
            if (user?.role === 'SUPER_ADMIN') return this.prisma.loan.findMany(); // Or separate admin endpoint
            throw new BadRequestException('User is not linked to a Loan Partner');
        }
        return this.findAllLoans(user.loanPartnerId);
    }



    async getDevicesForUser(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.loanPartnerId) {
            if (user?.role === 'SUPER_ADMIN') return this.prisma.device.findMany();
            throw new BadRequestException('User is not linked to a Loan Partner');
        }

        return this.prisma.device.findMany({
            where: {
                loans: {
                    some: { loanPartnerId: user.loanPartnerId }
                }
            },
            include: {
                loans: {
                    where: { loanPartnerId: user.loanPartnerId },
                    select: { status: true, outstandingAmount: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                merchant: {
                    select: {
                        id: true,
                        // @ts-ignore
                        merchantProfile: { select: { businessName: true } }
                    }
                }
            }
        });
    }

    async getCredentials(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.loanPartnerId) {
            throw new BadRequestException('User is not linked to a Loan Partner');
        }

        const partner = await this.prisma.loanPartner.findUnique({
            where: { id: user.loanPartnerId }
        });

        // Masking logic can be handled here or frontend. Let's send full key but frontend masks it by default.
        return {
            apiKey: partner?.apiKey,
            webhookSecret: partner?.webhookSecret,
            baseUrl: partner?.baseUrl
        };
    }

    async rotateApiKey(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.loanPartnerId) {
            throw new BadRequestException('User is not linked to a Loan Partner');
        }

        const newKey = `vl_live_sk_${crypto.randomBytes(24).toString('hex')}`;

        await this.prisma.loanPartner.update({
            where: { id: user.loanPartnerId },
            data: { apiKey: newKey }
        });

        return { apiKey: newKey };
    }

    // === LPIS: Loan Creation (Called by Partner System) ===
    async createLoanFromPartner(partnerId: string, dto: LpisCreateLoanDto) {
        // 1. Validate Merchant & Product
        const merchant = await this.prisma.user.findUnique({ where: { id: dto.merchantId } });
        if (!merchant) throw new NotFoundException('Merchant not found');

        const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
        if (!product) throw new NotFoundException('Product not found');

        // 2. Ideally, we verify the Device exists or Create it?
        // Usually Merchant adds Device Inventory FIRST.
        let device = await this.prisma.device.findUnique({ where: { imei: dto.deviceImei } });

        if (!device) {
            // If device not found, should we fail? Or auto-create as "PENDING_SETUP"?
            // For now, let's auto-create to reduce friction during testing
            device = await this.prisma.device.create({
                data: {
                    imei: dto.deviceImei,
                    status: 'PENDING_SETUP',
                    merchantId: dto.merchantId
                }
            });
        }

        // 3. Find Customer (User) by Phone or Create
        let user = await this.prisma.user.findUnique({ where: { email: `${dto.customerPhone}@vistalock.temp` } }); // Placeholder email logic
        // Need improved Customer Identity logic later

        if (!user) {
            // Creating a temporary user for the loan
            user = await this.prisma.user.create({
                data: {
                    email: `${dto.customerPhone}@vistalock.temp`,
                    role: 'CUSTOMER',
                    customerProfile: {
                        create: {
                            phoneNumber: dto.customerPhone,
                            nin: dto.customerNin,
                            kycStatus: 'PENDING'
                        }
                    }
                }
            });
        }


        // 4. Create Loan Record
        const loan = await this.prisma.loan.create({
            data: {
                userId: user.id,
                merchantId: dto.merchantId,
                agentId: dto.agentId,
                loanPartnerId: partnerId,

                deviceIMEI: dto.deviceImei,
                productId: dto.productId,

                customerPhone: dto.customerPhone,
                customerNIN: dto.customerNin || "PENDING",

                loanAmount: dto.loanAmount,
                downPayment: dto.downPayment,
                tenure: dto.tenure,
                monthlyRepayment: dto.monthlyRepayment,
                totalRepayment: (dto.monthlyRepayment * dto.tenure), // Simple calc
                outstandingAmount: (dto.monthlyRepayment * dto.tenure), // Initial full debt
                interestRate: dto.interestRate || 0, // Add interest rate

                status: 'ACTIVE', // Or PENDING if waiting approval?
            }
        });

        // 5. Trigger Device Setup? (Send SMS to Customer?)
        // TODO: NotificationService.sendSetupLink(user.phone, device.imei)

        return loan;
    }

    // === LPIS: Webhook Handler (Called by Partner System) ===
    async handleWebhook(partnerId: string, event: LpisWebhookDto) {
        // 1. Log Event
        await this.prisma.webhookLog.create({
            data: {
                loanPartnerId: partnerId,
                eventType: event.event,
                payload: event as any,
                responseCode: 200,
                status: 'PROCESSED'
            }
        });

        // 2. Find Loan
        const loan = await this.prisma.loan.findUnique({ where: { id: event.loanId } });
        if (!loan) {
            this.logger.warn(`Webhook received for unknown loan: ${event.loanId}`);
            // Return success to avoid webhook retries for bad data?
            return { status: 'IGNORED', reason: 'Loan not found' };
        }

        // 3. Action Logic
        switch (event.event) {
            case 'PAYMENT_RECEIVED':
                // Update Outstanding
                // Trigger UNLOCK (if locked)
                await this.lockService.sendCommand(loan.deviceIMEI, 'UNLOCK', 'Payment Received', 'LOAN_PARTNER_WEBHOOK');

                await this.prisma.loan.update({
                    where: { id: loan.id },
                    data: {
                        // Logic to reduce outstanding
                        status: 'ACTIVE',
                        isLocked: false,
                        // @ts-ignore
                        outstandingAmount: event.amount ? { decrement: event.amount } : undefined
                    }
                });
                break;

            case 'PAYMENT_MISSED': // or OVERDUE
                // Trigger SOFT LOCK
                await this.lockService.sendCommand(loan.deviceIMEI, 'SOFT_LOCK', 'Payment Missed', 'LOAN_PARTNER_WEBHOOK');

                await this.prisma.loan.update({
                    where: { id: loan.id },
                    data: {
                        status: 'ACTIVE', // Or create OVERDUE status?
                        // "isLocked" is boolean on Loan, but Device also has status
                        isLocked: true
                    }
                });
                break;

            case 'LOAN_DEFAULTED':
                // HARD LOCK
                await this.lockService.sendCommand(loan.deviceIMEI, 'LOCK', 'Loan Defaulted', 'LOAN_PARTNER_WEBHOOK');

                await this.prisma.loan.update({
                    where: { id: loan.id },
                    data: { status: 'DEFAULTED', isLocked: true }
                });
                break;

            case 'LOAN_SETTLED':
                // PERMANENT UNLOCK
                await this.lockService.sendCommand(loan.deviceIMEI, 'UNLOCK', 'Loan Settled', 'LOAN_PARTNER_WEBHOOK');

                await this.prisma.loan.update({
                    where: { id: loan.id },
                    data: { status: 'COMPLETED', isLocked: false, outstandingAmount: 0 }
                });
                break;
        }

        return { status: 'PROCESSED' };
    }
}
