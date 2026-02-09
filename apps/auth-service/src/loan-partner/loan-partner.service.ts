import { Injectable, Logger, BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
    CreateLoanPartnerDto,
    UpdateLoanPartnerDto,
    LoanPartnerLoginDto,
    CreateLoanFromPartnerDto,
    PaymentUpdateDto,
    OverdueNotificationDto,
    LoanClosureDto,
    DisputeDto
} from './dto';
import { DeviceControlService } from '../device-control/device-control.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoanPartnerService {
    private readonly logger = new Logger(LoanPartnerService.name);

    constructor(
        private prisma: PrismaService,
        private lockService: DeviceControlService
    ) { }

    // ==================== MERCHANT LOAN PARTNER MANAGEMENT ====================

    /**
     * Create a new loan partner for a merchant
     */
    async createPartnerForMerchant(merchantId: string, dto: CreateLoanPartnerDto) {
        // Check if slug already exists for this merchant
        const exists = await this.prisma.loanPartner.findFirst({
            where: {
                merchantId,
                slug: dto.slug
            }
        });

        if (exists) {
            throw new BadRequestException(`Loan partner with slug "${dto.slug}" already exists for your account`);
        }

        // Generate API credentials for the loan partner
        const apiKey = this.generateApiKey();
        const apiSecret = this.generateApiSecret();
        const hashedSecret = await bcrypt.hash(apiSecret, 10);

        const partner = await this.prisma.loanPartner.create({
            data: {
                merchantId,
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                logoUrl: dto.logoUrl,
                contactName: dto.contactName,
                contactEmail: dto.contactEmail,
                contactPhone: dto.contactPhone,
                webhookUrl: dto.webhookUrl,
                apiKey,
                apiSecret: hashedSecret,
                minDownPaymentPct: dto.minDownPaymentPct || 30.0,
                maxTenure: dto.maxTenure || 12,
                status: 'ACTIVE'
            }
        });

        this.logger.log(`Created loan partner ${partner.name} for merchant ${merchantId}`);

        // Return partner with plain text secret (only time it's visible)
        return {
            ...partner,
            apiSecret: apiSecret, // Plain text - save this!
            apiSecretHashed: undefined // Don't return hash
        };
    }

    /**
     * Get all loan partners for a merchant
     */
    async findAllForMerchant(merchantId: string) {
        return this.prisma.loanPartner.findMany({
            where: { merchantId },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                logoUrl: true,
                contactName: true,
                contactEmail: true,
                contactPhone: true,
                webhookUrl: true,
                status: true,
                minDownPaymentPct: true,
                maxTenure: true,
                createdAt: true,
                updatedAt: true,
                apiKey: true, // Show API key
                apiSecret: false // Never show hashed secret
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get a single loan partner (merchant-scoped)
     */
    async findOneForMerchant(merchantId: string, partnerId: string) {
        const partner = await this.prisma.loanPartner.findFirst({
            where: {
                id: partnerId,
                merchantId
            }
        });

        if (!partner) {
            throw new NotFoundException('Loan partner not found');
        }

        return partner;
    }

    /**
     * Update a loan partner (merchant-scoped)
     */
    async updatePartnerForMerchant(merchantId: string, partnerId: string, dto: UpdateLoanPartnerDto) {
        // Verify ownership
        await this.findOneForMerchant(merchantId, partnerId);

        return this.prisma.loanPartner.update({
            where: { id: partnerId },
            data: dto
        });
    }

    /**
     * Delete a loan partner (merchant-scoped)
     */
    async deletePartnerForMerchant(merchantId: string, partnerId: string) {
        // Verify ownership
        await this.findOneForMerchant(merchantId, partnerId);

        // Check if partner has active loans
        const activeLoans = await this.prisma.loan.count({
            where: {
                loanPartnerId: partnerId,
                status: { in: ['PENDING', 'ACTIVE'] }
            }
        });

        if (activeLoans > 0) {
            throw new BadRequestException(`Cannot delete loan partner with ${activeLoans} active loans`);
        }

        await this.prisma.loanPartner.delete({
            where: { id: partnerId }
        });

        this.logger.log(`Deleted loan partner ${partnerId} for merchant ${merchantId}`);

        return { success: true, message: 'Loan partner deleted successfully' };
    }

    /**
     * Rotate API credentials for a loan partner
     */
    async rotateApiCredentials(merchantId: string, partnerId: string) {
        // Verify ownership
        await this.findOneForMerchant(merchantId, partnerId);

        const newApiKey = this.generateApiKey();
        const newApiSecret = this.generateApiSecret();
        const hashedSecret = await bcrypt.hash(newApiSecret, 10);

        const updated = await this.prisma.loanPartner.update({
            where: { id: partnerId },
            data: {
                apiKey: newApiKey,
                apiSecret: hashedSecret
            }
        });

        this.logger.warn(`Rotated API credentials for loan partner ${partnerId}`);

        return {
            apiKey: newApiKey,
            apiSecret: newApiSecret, // Plain text - save this!
            message: 'API credentials rotated successfully. Save the new secret - it will not be shown again.'
        };
    }

    /**
     * Test webhook connection for a loan partner
     */
    async testWebhook(merchantId: string, partnerId: string) {
        const partner = await this.findOneForMerchant(merchantId, partnerId);

        if (!partner.webhookUrl) {
            throw new BadRequestException('No webhook URL configured for this partner');
        }

        try {
            const testPayload = {
                event: 'TEST',
                timestamp: new Date().toISOString(),
                message: 'VistaLock webhook test'
            };

            // TODO: Implement actual HTTP request to webhook URL
            // For now, just log
            this.logger.log(`Testing webhook for partner ${partnerId}: ${partner.webhookUrl}`);

            return {
                success: true,
                webhookUrl: partner.webhookUrl,
                message: 'Webhook test successful'
            };
        } catch (error) {
            this.logger.error(`Webhook test failed for partner ${partnerId}:`, error);
            return {
                success: false,
                webhookUrl: partner.webhookUrl,
                error: error.message
            };
        }
    }

    // ==================== EXTERNAL LOAN PARTNER API ====================

    /**
     * Authenticate a loan partner using API key and secret
     */
    async authenticateLoanPartner(dto: LoanPartnerLoginDto) {
        const partner = await this.prisma.loanPartner.findUnique({
            where: { apiKey: dto.apiKey },
            include: { merchant: true }
        });

        if (!partner) {
            throw new UnauthorizedException('Invalid API credentials');
        }

        if (partner.status !== 'ACTIVE') {
            throw new UnauthorizedException('Loan partner account is inactive');
        }

        // Verify API secret
        const isValid = await bcrypt.compare(dto.apiSecret, partner.apiSecret);
        if (!isValid) {
            throw new UnauthorizedException('Invalid API credentials');
        }

        // Generate JWT token for the loan partner
        // TODO: Implement JWT token generation
        const accessToken = this.generateAccessToken(partner.id, partner.merchantId);

        this.logger.log(`Loan partner ${partner.name} authenticated successfully`);

        return {
            accessToken,
            expiresIn: 3600,
            partner: {
                id: partner.id,
                name: partner.name,
                merchantId: partner.merchantId,
                merchantName: partner.merchant.email // TODO: Use merchant business name
            }
        };
    }

    /**
     * Create a loan from external loan partner
     */
    async createLoanFromPartner(partnerId: string, dto: CreateLoanFromPartnerDto) {
        const partner = await this.prisma.loanPartner.findUnique({
            where: { id: partnerId },
            include: { merchant: true }
        });

        if (!partner) {
            throw new NotFoundException('Loan partner not found');
        }

        // Find or create device
        let device = await this.prisma.device.findUnique({
            where: { imei: dto.deviceImei }
        });

        if (!device) {
            // Create device if it doesn't exist
            device = await this.prisma.device.create({
                data: {
                    imei: dto.deviceImei,
                    merchantId: partner.merchantId,
                    status: 'PENDING_SETUP'
                }
            });
        }

        // Verify device belongs to the merchant
        if (device.merchantId !== partner.merchantId) {
            throw new ForbiddenException('Device does not belong to this merchant');
        }

        // Find or create customer
        let customer = await this.prisma.user.findFirst({
            where: {
                email: dto.customerPhone + '@vistalock.temp', // Temporary email
                role: 'CUSTOMER'
            }
        });

        if (!customer) {
            customer = await this.prisma.user.create({
                data: {
                    email: dto.customerPhone + '@vistalock.temp',
                    role: 'CUSTOMER',
                    customerProfile: {
                        create: {
                            fullName: 'Customer', // TODO: Get from dto
                            phoneNumber: dto.customerPhone,
                            nin: dto.customerNin
                        }
                    }
                }
            });
        }

        // Create loan
        const loan = await this.prisma.loan.create({
            data: {
                userId: customer.id,
                merchantId: partner.merchantId,
                loanPartnerId: partner.id,
                productId: dto.productId,
                deviceId: device.id,
                loanAmount: dto.loanAmount,
                downPayment: dto.downPayment,
                tenure: dto.tenure,
                monthlyRepayment: dto.monthlyRepayment,
                interestRate: dto.interestRate || 0,
                status: 'ACTIVE',
                repaymentSchedule: dto.repaymentSchedule || []
            }
        });

        this.logger.log(`Loan ${loan.id} created by partner ${partner.name}`);

        return {
            success: true,
            loanId: loan.id,
            deviceId: device.id,
            customerId: customer.id,
            message: 'Loan created successfully'
        };
    }

    /**
     * Update payment status from loan partner
     */
    async updatePayment(partnerId: string, dto: PaymentUpdateDto) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: dto.loanId },
            include: { device: true }
        });

        if (!loan) {
            throw new NotFoundException('Loan not found');
        }

        if (loan.loanPartnerId !== partnerId) {
            throw new ForbiddenException('This loan does not belong to your partner account');
        }

        // Update loan status
        await this.prisma.loan.update({
            where: { id: dto.loanId },
            data: {
                // TODO: Add payment tracking fields
                status: dto.status === 'PAID' ? 'COMPLETED' : 'ACTIVE'
            }
        });

        // Unlock device if payment is current
        if (dto.status === 'CURRENT' || dto.status === 'PAID') {
            await this.lockService.unlockDevice(loan.deviceId, 'Payment received');
        }

        this.logger.log(`Payment updated for loan ${dto.loanId}: ${dto.amountPaid}`);

        return {
            success: true,
            deviceUnlocked: dto.status === 'CURRENT' || dto.status === 'PAID',
            message: 'Payment updated successfully'
        };
    }

    /**
     * Handle overdue notification from loan partner
     */
    async handleOverdueNotification(partnerId: string, dto: OverdueNotificationDto) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: dto.loanId },
            include: { device: true }
        });

        if (!loan) {
            throw new NotFoundException('Loan not found');
        }

        if (loan.loanPartnerId !== partnerId) {
            throw new ForbiddenException('This loan does not belong to your partner account');
        }

        // Take action based on days overdue
        if (dto.actionRequired === 'LOCK_DEVICE') {
            await this.lockService.lockDevice(loan.deviceId, `Payment overdue: ${dto.daysOverdue} days`);
        }

        this.logger.warn(`Loan ${dto.loanId} is ${dto.daysOverdue} days overdue`);

        return {
            success: true,
            deviceLocked: dto.actionRequired === 'LOCK_DEVICE',
            message: 'Overdue notification processed'
        };
    }

    /**
     * Close a loan from loan partner
     */
    async closeLoan(partnerId: string, dto: LoanClosureDto) {
        const loan = await this.prisma.loan.findUnique({
            where: { id: dto.loanId },
            include: { device: true }
        });

        if (!loan) {
            throw new NotFoundException('Loan not found');
        }

        if (loan.loanPartnerId !== partnerId) {
            throw new ForbiddenException('This loan does not belong to your partner account');
        }

        // Update loan status
        await this.prisma.loan.update({
            where: { id: dto.loanId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(dto.closedAt)
            }
        });

        // Unlock device permanently
        await this.lockService.unlockDevice(loan.deviceId, 'Loan completed');

        this.logger.log(`Loan ${dto.loanId} closed successfully`);

        return {
            success: true,
            deviceUnlocked: true,
            message: 'Loan closed successfully'
        };
    }

    /**
     * Get devices for a loan partner (merchant-scoped)
     */
    async getDevicesForPartner(partnerId: string) {
        const partner = await this.prisma.loanPartner.findUnique({
            where: { id: partnerId }
        });

        if (!partner) {
            throw new NotFoundException('Loan partner not found');
        }

        return this.prisma.device.findMany({
            where: {
                merchantId: partner.merchantId,
                loans: {
                    some: {
                        loanPartnerId: partnerId
                    }
                }
            },
            include: {
                loans: {
                    where: { loanPartnerId: partnerId },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
    }

    /**
     * Get loans for a loan partner (merchant-scoped)
     */
    async getLoansForPartner(partnerId: string) {
        const partner = await this.prisma.loanPartner.findUnique({
            where: { id: partnerId }
        });

        if (!partner) {
            throw new NotFoundException('Loan partner not found');
        }

        return this.prisma.loan.findMany({
            where: { loanPartnerId: partnerId },
            include: {
                device: true,
                product: true,
                user: {
                    include: {
                        customerProfile: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // ==================== HELPER METHODS ====================

    private generateApiKey(): string {
        return 'vl_' + crypto.randomBytes(32).toString('hex');
    }

    private generateApiSecret(): string {
        return crypto.randomBytes(48).toString('base64');
    }

    private generateAccessToken(partnerId: string, merchantId: string): string {
        // TODO: Implement proper JWT token generation
        return crypto.randomBytes(32).toString('hex');
    }
}
