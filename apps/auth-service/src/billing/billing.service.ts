import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { WalletService } from './wallet.service';
import { EnrollmentBillingQueryDto, UsageStatsQueryDto } from './dto';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);

    constructor(
        private prisma: PrismaService,
        private walletService: WalletService
    ) { }

    /**
     * Calculate enrollment fee based on merchant's monthly volume
     */
    async calculateEnrollmentFee(merchantId: string): Promise<{ amount: number; tier: string }> {
        // Get merchant's enrollment count for current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyEnrollments = await this.prisma.enrollmentBilling.count({
            where: {
                merchantId,
                createdAt: { gte: startOfMonth },
                status: 'PAID'
            }
        });

        // Get applicable pricing tier
        const tier = await this.prisma.pricingTier.findFirst({
            where: {
                isActive: true,
                minVolume: { lte: monthlyEnrollments },
                OR: [
                    { maxVolume: { gte: monthlyEnrollments } },
                    { maxVolume: null }
                ]
            },
            orderBy: { minVolume: 'desc' }
        });

        if (!tier) {
            // Default to highest tier if no tier found
            const defaultTier = await this.prisma.pricingTier.findFirst({
                where: { isActive: true },
                orderBy: { pricePerDevice: 'asc' }
            });

            return {
                amount: defaultTier ? Number(defaultTier.pricePerDevice) : 1500,
                tier: defaultTier?.name || 'Default'
            };
        }

        return {
            amount: Number(tier.pricePerDevice),
            tier: tier.name
        };
    }

    /**
     * Process enrollment billing for a device
     */
    async processEnrollmentBilling(merchantId: string, deviceId: string) {
        // Calculate fee
        const { amount, tier } = await this.calculateEnrollmentFee(merchantId);

        // Get current monthly volume
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const volumeAtTime = await this.prisma.enrollmentBilling.count({
            where: {
                merchantId,
                createdAt: { gte: startOfMonth },
                status: 'PAID'
            }
        });

        // Check wallet balance
        const hasSufficientBalance = await this.walletService.hasSufficientBalance(merchantId, amount);

        if (!hasSufficientBalance) {
            // Create pending billing record
            const billing = await this.prisma.enrollmentBilling.create({
                data: {
                    merchantId,
                    deviceId,
                    amount,
                    tier,
                    volumeAtTime,
                    status: 'PENDING'
                }
            });

            this.logger.warn(`Insufficient balance for enrollment billing: ${deviceId}`);

            return {
                success: false,
                billing,
                message: `Insufficient wallet balance. Required: ₦${amount}. Please top up your wallet.`
            };
        }

        // Deduct from wallet
        await this.walletService.deduct(
            merchantId,
            amount,
            `Device enrollment fee - ${tier} tier`,
            `ENROLL-${deviceId}`
        );

        // Create paid billing record
        const billing = await this.prisma.enrollmentBilling.create({
            data: {
                merchantId,
                deviceId,
                amount,
                tier,
                volumeAtTime,
                status: 'PAID',
                paidAt: new Date()
            }
        });

        this.logger.log(`Processed enrollment billing for device ${deviceId}: ₦${amount} (${tier})`);

        return {
            success: true,
            billing,
            message: `Enrollment fee of ₦${amount} charged successfully`
        };
    }

    /**
     * Get enrollment billing history
     */
    async getEnrollmentHistory(merchantId: string, query: EnrollmentBillingQueryDto) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { merchantId };

        if (query.status) {
            where.status = query.status;
        }

        if (query.startDate || query.endDate) {
            where.createdAt = {};
            if (query.startDate) {
                where.createdAt.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.createdAt.lte = new Date(query.endDate);
            }
        }

        const [billings, total] = await Promise.all([
            this.prisma.enrollmentBilling.findMany({
                where,
                skip,
                take: limit,
                include: {
                    device: {
                        select: {
                            imei: true,
                            model: true,
                            status: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.enrollmentBilling.count({ where })
        ]);

        return {
            billings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get current pricing tiers
     */
    async getPricingTiers() {
        return this.prisma.pricingTier.findMany({
            where: { isActive: true },
            orderBy: { minVolume: 'asc' }
        });
    }

    /**
     * Get monthly usage statistics
     */
    async getUsageStats(merchantId: string, query: UsageStatsQueryDto) {
        const month = query.month || new Date().getMonth() + 1;
        const year = query.year || new Date().getFullYear();

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Get enrollments for the month
        const enrollments = await this.prisma.enrollmentBilling.findMany({
            where: {
                merchantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const totalEnrollments = enrollments.length;
        const paidEnrollments = enrollments.filter(e => e.status === 'PAID').length;
        const totalFees = enrollments
            .filter(e => e.status === 'PAID')
            .reduce((sum, e) => sum + Number(e.amount), 0);

        // Get current tier
        const { tier, amount: currentTierPrice } = await this.calculateEnrollmentFee(merchantId);

        // Get wallet balance
        const { balance: walletBalance } = await this.walletService.getBalance(merchantId);

        // Project next month (assuming same volume)
        const projectedNextMonth = totalEnrollments * currentTierPrice;

        return {
            period: {
                month,
                year,
                startDate,
                endDate
            },
            enrollments: {
                total: totalEnrollments,
                paid: paidEnrollments,
                pending: totalEnrollments - paidEnrollments
            },
            fees: {
                total: totalFees,
                currency: 'NGN'
            },
            currentTier: {
                name: tier,
                pricePerDevice: currentTierPrice
            },
            wallet: {
                balance: walletBalance,
                currency: 'NGN'
            },
            projection: {
                nextMonthEstimate: projectedNextMonth,
                message: `Based on ${totalEnrollments} enrollments this month`
            }
        };
    }

    /**
     * Process refund for enrollment billing
     */
    async processRefund(billingId: string, reason: string) {
        const billing = await this.prisma.enrollmentBilling.findUnique({
            where: { id: billingId }
        });

        if (!billing) {
            throw new NotFoundException('Billing record not found');
        }

        if (billing.status !== 'PAID') {
            throw new NotFoundException('Can only refund paid billings');
        }

        // Credit wallet
        await this.walletService.deduct(
            billing.merchantId,
            -Number(billing.amount), // Negative deduction = credit
            `Refund: ${reason}`,
            `REFUND-${billingId}`
        );

        // Update billing status
        await this.prisma.enrollmentBilling.update({
            where: { id: billingId },
            data: {
                status: 'REVERSED',
                reversedAt: new Date(),
                reversalReason: reason
            }
        });

        this.logger.log(`Processed refund for billing ${billingId}: ₦${billing.amount}`);

        return {
            success: true,
            amount: billing.amount,
            message: 'Refund processed successfully'
        };
    }
}
