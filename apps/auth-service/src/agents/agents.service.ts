import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AgentsService {
    private prisma: PrismaClient;

    constructor(private notificationsService: NotificationsService) {
        this.prisma = new PrismaClient({
            datasources: { db: { url: process.env.DATABASE_URL } }
        });
    }

    /**
     * Generate a secure activation token
     */
    private generateActivationToken(): string {
        return randomBytes(32).toString('hex'); // 64 characters
    }

    /**
     * Create a new agent with activation token
     */
    async createAgent(merchantId: string, data: {
        fullName: string;
        phoneNumber: string;
        email?: string;
        branch: string;
        onboardingLimit?: number;
    }) {
        // Check if user already exists with this email or phone-based email
        const emailToCheck = data.email || `${data.phoneNumber}@agent.vistalock.com`;

        const existing = await this.prisma.user.findUnique({
            where: {
                email: emailToCheck
            }
        });

        if (existing) {
            throw new ConflictException('User with this email/phone already exists');
        }

        // Generate activation token
        const activationToken = this.generateActivationToken();
        const activationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user and agent profile
        const agent = await this.prisma.user.create({
            data: {
                email: data.email || `${data.phoneNumber}@agent.vistalock.com`,
                role: 'MERCHANT_AGENT',
                merchantId,
                isActive: true,
                agentProfile: {
                    create: {
                        fullName: data.fullName,
                        phoneNumber: data.phoneNumber,
                        branch: data.branch,
                        onboardingLimit: data.onboardingLimit || 10,
                        status: 'PENDING',
                        activationToken,
                        activationExpiresAt,
                        isActivated: false
                    }
                }
            },
            include: {
                agentProfile: true
            }
        });

        // Generate activation link
        const baseUrl = process.env.DASHBOARD_URL || 'http://localhost:3005';
        const activationLink = `${baseUrl}/activate?token=${activationToken}`;

        // Send activation SMS
        await this.notificationsService.sendActivationSMS(
            data.phoneNumber,
            activationLink,
            data.fullName
        );

        // Send activation email if provided
        if (data.email) {
            await this.notificationsService.sendActivationEmail(
                data.email,
                activationLink,
                data.fullName
            );
        }

        return {
            agentId: agent.id,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            activationToken,
            activationLink,
            expiresAt: activationExpiresAt
        };
    }

    /**
     * Validate activation token
     */
    async validateActivationToken(token: string) {
        const agentProfile = await this.prisma.agentProfile.findUnique({
            where: { activationToken: token },
            include: {
                user: {
                    include: {
                        merchant: {
                            include: {
                                merchantProfile: true
                            }
                        }
                    }
                }
            }
        });

        if (!agentProfile) {
            return { valid: false, message: 'Invalid activation token' };
        }

        if (agentProfile.isActivated) {
            return { valid: false, message: 'This agent has already been activated' };
        }

        if (agentProfile.activationExpiresAt && new Date() > agentProfile.activationExpiresAt) {
            return { valid: false, message: 'Activation token has expired' };
        }

        return {
            valid: true,
            agentName: agentProfile.fullName,
            merchantName: agentProfile.user.merchant?.merchantProfile?.businessName || 'Unknown Merchant',
            phoneNumber: agentProfile.phoneNumber,
            expiresAt: agentProfile.activationExpiresAt
        };
    }

    /**
     * Activate agent account
     */
    async activateAgent(data: {
        token: string;
        password: string;
        deviceId?: string;  // Optional, not used
    }) {
        // Validate token first
        const validation = await this.validateActivationToken(data.token);
        if (!validation.valid) {
            throw new BadRequestException(validation.message);
        }

        // Find agent profile
        const agentProfile = await this.prisma.agentProfile.findUnique({
            where: { activationToken: data.token },
            include: { user: true }
        });

        if (!agentProfile) {
            throw new NotFoundException('Agent not found');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Update user and agent profile
        await this.prisma.user.update({
            where: { id: agentProfile.userId },
            data: {
                password: passwordHash,
                agentProfile: {
                    update: {
                        isActivated: true,
                        deviceId: null,  // Will be set on first mobile login
                        status: 'ACTIVE',
                        activationToken: null, // Clear token after use
                        lastLoginAt: new Date()
                    }
                }
            }
        });

        return {
            success: true,
            userId: agentProfile.userId,
            message: 'Agent account activated successfully. Please log in on your mobile device.'
        };
    }

    /**
     * List all agents for a merchant
     */
    async findAll(merchantId: string) {
        return this.prisma.user.findMany({
            where: {
                merchantId,
                role: 'MERCHANT_AGENT'
            },
            include: {
                agentProfile: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    /**
     * Get single agent
     */
    async findOne(agentId: string, merchantId: string) {
        const agent = await this.prisma.user.findFirst({
            where: {
                id: agentId,
                merchantId,
                role: 'MERCHANT_AGENT'
            },
            include: {
                agentProfile: true
            }
        });

        if (!agent) {
            throw new NotFoundException('Agent not found');
        }

        return agent;
    }

    /**
     * Update agent details
     */
    async updateAgent(agentId: string, merchantId: string, data: {
        fullName?: string;
        branch?: string;
        onboardingLimit?: number;
    }) {
        // Verify ownership
        await this.findOne(agentId, merchantId);

        return this.prisma.agentProfile.update({
            where: { userId: agentId },
            data
        });
    }

    /**
     * Deactivate agent
     */
    async deactivateAgent(agentId: string, merchantId: string) {
        // Verify ownership
        await this.findOne(agentId, merchantId);

        return this.prisma.agentProfile.update({
            where: { userId: agentId },
            data: {
                status: 'DEACTIVATED',
                isActivated: false
            }
        });
    }

    /**
     * Permanently delete agent (Hard Delete)
     */
    async permanentlyDeleteAgent(agentId: string, merchantId: string) {
        // Verify ownership
        await this.findOne(agentId, merchantId);

        // Delete relations first since there is no onDelete: Cascade
        return this.prisma.$transaction(async (tx) => {
            await tx.refreshToken.deleteMany({ where: { userId: agentId } });
            await tx.agentLoginLog.deleteMany({ where: { userId: agentId } });
            await tx.auditLog.deleteMany({ where: { userId: agentId } });

            const profile = await tx.agentProfile.findUnique({ where: { userId: agentId } });
            if (profile) {
                await tx.agentProfile.delete({ where: { userId: agentId } });
            }

            return tx.user.delete({ where: { id: agentId } });
        });
    }

    /**
     * Resend activation link (regenerate token)
     */
    async resendActivation(agentId: string, merchantId: string) {
        const agent = await this.findOne(agentId, merchantId);

        if (agent.agentProfile?.isActivated) {
            throw new BadRequestException('Agent is already activated');
        }

        // Generate new token
        const activationToken = this.generateActivationToken();
        const activationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.prisma.agentProfile.update({
            where: { userId: agentId },
            data: {
                activationToken,
                activationExpiresAt
            }
        });

        const baseUrl = process.env.DASHBOARD_URL || 'http://localhost:3005';
        const activationLink = `${baseUrl}/activate?token=${activationToken}`;

        return {
            activationToken,
            activationLink,
            expiresAt: activationExpiresAt
        };
    }

    /**
     * Unbind device from agent (for lost/stolen devices)
     */
    async unbindDevice(agentId: string, merchantId: string) {
        // Verify ownership
        await this.findOne(agentId, merchantId);

        await this.prisma.agentProfile.update({
            where: { userId: agentId },
            data: {
                deviceId: null
            }
        });

        return {
            success: true,
            message: 'Device unbound successfully. Agent can now log in from a new device.'
        };
    }

    /**
     * Get agent login logs
     */
    async getLoginLogs(agentId: string, merchantId: string) {
        // Verify ownership
        await this.findOne(agentId, merchantId);

        const logs = await this.prisma.agentLoginLog.findMany({
            where: { userId: agentId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Last 50 login attempts
        });

        return logs;
    }

    // ==========================================
    // Phase 4: Mobile App Specific Endpoints
    // ==========================================

    /**
     * Handle the entire 5-step "New Sale" wizard payload
     */
    async createAgentSale(agentId: string, merchantId: string, data: any) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Verify Agent
            const agent = await tx.user.findFirst({
                where: { id: agentId, merchantId, role: 'MERCHANT_AGENT', isActive: true },
                include: { agentProfile: true }
            });
            if (!agent) throw new BadRequestException('Invalid agent context');

            // 2. Locate Product & Validate Constraints
            const product = await tx.product.findUnique({ where: { id: data.productId } });
            if (!product || product.merchantId !== merchantId) {
                throw new NotFoundException('Product not found or unavailable');
            }

            if (data.tenureMonths < product.minTenure || data.tenureMonths > product.maxTenure) {
                throw new BadRequestException(`Tenure must be between ${product.minTenure} and ${product.maxTenure}`);
            }

            if (data.downPayment < Number(product.minDownPayment)) {
                throw new BadRequestException(`Minimum down payment is ${product.minDownPayment}`);
            }

            // 3. Locate & Lock Device
            const device = await tx.device.findFirst({
                where: { imei: data.imei, merchantId }
            });
            if (!device) throw new NotFoundException('Device not found in merchant inventory');
            if (device.status !== 'PENDING_SETUP') throw new ConflictException('Device is already assigned or locked');

            // 4. Find/Create Customer User
            const email = `${data.phoneNumber}@vistalock.customer`;
            let customerUser = await tx.user.findUnique({ where: { email } });
            if (!customerUser) {
                customerUser = await tx.user.create({
                    data: {
                        email,
                        password: 'default_password', // To be set by customer later
                        role: 'CUSTOMER'
                    }
                });
            }

            // 5. Find/Create CustomerProfile
            let profile = await tx.customerProfile.findUnique({ where: { userId: customerUser.id } });
            if (!profile) {
                profile = await tx.customerProfile.create({
                    data: {
                        userId: customerUser.id,
                        phoneNumber: data.phoneNumber,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        nin: data.nin,
                        address: data.address,
                        photoUrl: data.selfieUrl,
                        kycStatus: 'VERIFIED'
                    }
                });
            } else {
                // Update specific KYC details
                await tx.customerProfile.update({
                    where: { id: profile.id },
                    data: {
                        firstName: data.firstName || profile.firstName,
                        lastName: data.lastName || profile.lastName,
                        nin: data.nin || profile.nin,
                        address: data.address || profile.address,
                        photoUrl: data.selfieUrl || profile.photoUrl,
                    }
                });
            }

            // 6. Setup Loan & Installments
            const price = Number(product.price);
            const principal = price - data.downPayment;
            const monthlyRate = Number(product.interestRate) / 100;
            const totalRepayment = principal + (principal * monthlyRate * data.tenureMonths);
            const monthlyRepayment = totalRepayment / data.tenureMonths;

            const loan = await tx.loan.create({
                data: {
                    userId: customerUser.id,
                    customerNIN: data.nin || profile.nin || '00000000000',
                    customerPhone: profile.phoneNumber,
                    deviceIMEI: device.imei,
                    productId: product.id,
                    merchantId: merchantId,
                    agentId: agent.id,
                    loanAmount: principal,
                    downPayment: data.downPayment,
                    monthlyRepayment,
                    tenure: data.tenureMonths,
                    interestRate: Number(product.interestRate),
                    totalRepayment,
                    outstandingAmount: totalRepayment,
                    status: 'ACTIVE',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            const installments: any[] = [];
            let currentDate = new Date();
            for (let i = 1; i <= data.tenureMonths; i++) {
                currentDate.setMonth(currentDate.getMonth() + 1);
                installments.push({
                    loanId: loan.id,
                    amount: monthlyRepayment,
                    dueDate: new Date(currentDate),
                    status: 'PENDING'
                });
            }
            await tx.payment.createMany({ data: installments });

            // 7. Make the Device Assigned/Unlocked initially
            await tx.device.update({
                where: { id: device.id },
                data: { status: 'UNLOCKED' }
            });

            // 8. Handle Agent Commission (Phase 6)
            const commissionAmount = Number(product.agentCommission);
            if (commissionAmount > 0 && agent.agentProfile) {
                const availableSplit = commissionAmount * 0.70;
                const withheldSplit = commissionAmount * 0.30;

                await tx.agentProfile.update({
                    where: { id: agent.agentProfile.id },
                    data: {
                        totalCommissionEarned: { increment: commissionAmount },
                        availableCommission: { increment: availableSplit },
                        withheldCommission: { increment: withheldSplit }
                    }
                });

                // In a production app, we would log this specific transaction
                await tx.auditLog.create({
                    data: {
                        action: 'AGENT_COMMISSION_GRANTED',
                        userId: agent.id,
                        details: {
                            loanId: loan.id,
                            totalCommission: commissionAmount,
                            available: availableSplit,
                            withheld: withheldSplit
                        }
                    }
                });
            }

            return {
                message: 'Sale successfully processed',
                loanId: loan.id,
                deviceImei: device.imei
            };
        });
    }

    async getDashboardStats(agentId: string, merchantId: string) {
        // Find loans for this agent today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todaySalesCount = await this.prisma.loan.count({
            where: { agentId, createdAt: { gte: startOfDay } }
        });

        // Sum up total loan amounts (for portfolio/commissions math)
        const loans = await this.prisma.loan.findMany({
            where: { agentId, merchantId }
        });

        let totalPortfolio = 0;
        let overdueCount = 0;
        loans.forEach(loan => {
            totalPortfolio += Number(loan.totalRepayment);
            if (loan.paymentsMissed > 0 || loan.status === 'DEFAULTED') {
                overdueCount++;
            }
        });

        // Get actual commission numbers
        const agentProfile = await this.prisma.agentProfile.findUnique({
            where: { userId: agentId },
            select: { availableCommission: true, withheldCommission: true }
        });

        return {
            todaySales: todaySalesCount,
            totalPortfolio,
            overdueCount,
            recoveryRate: 98, // Mocked for now until we have robust payment tracking
            availableCommission: Number(agentProfile?.availableCommission || 0),
            withheldCommission: Number(agentProfile?.withheldCommission || 0)
        };
    }

    async getAgentCustomers(agentId: string, merchantId: string) {
        const loans = await this.prisma.loan.findMany({
            where: { agentId, merchantId },
            include: { user: { include: { customerProfile: true } }, device: true, product: true }
        });

        return loans.map(loan => ({
            id: loan.user.id,
            name: `${loan.user.customerProfile?.firstName || ''} ${loan.user.customerProfile?.lastName || ''}`.trim(),
            phone: loan.customerPhone,
            device: loan.product.name,
            imei: loan.device.imei,
            loanStatus: loan.status,
            risk: loan.paymentsMissed > 0 ? 'HIGH' : 'LOW'
        }));
    }

    async getAgentDevices(agentId: string, merchantId: string) {
        const loans = await this.prisma.loan.findMany({
            where: { agentId, merchantId },
            include: { device: true, product: true, user: { include: { customerProfile: true } } }
        });

        return loans.map(loan => ({
            id: loan.device.id,
            model: loan.product.name,
            imei: loan.device.imei,
            status: loan.device.status,
            customer: `${loan.user.customerProfile?.firstName || ''} ${loan.user.customerProfile?.lastName || ''}`.trim()
        }));
    }

    /**
     * Get mock notifications for Agent App
     */
    async getAgentNotifications(agentId: string, merchantId: string) {
        return [
            {
                id: '1',
                type: 'SUCCESS',
                title: 'Sale Approved',
                message: 'Your recent sale to John Doe has been approved by the Credit Engine.',
                read: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                type: 'WARNING',
                title: 'Device Lock Alert',
                message: 'Device IMEI 359...890 has been locked due to missed payment.',
                read: true,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '3',
                type: 'INFO',
                title: 'New Product Available',
                message: 'Samsung Galaxy S24 is now available for financing.',
                read: true,
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
    }
}
