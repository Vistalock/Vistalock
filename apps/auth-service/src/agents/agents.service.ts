import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
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
        // Check if phone number already exists for this merchant
        const existing = await this.prisma.user.findFirst({
            where: {
                email: data.email || data.phoneNumber + '@agent.vistalock.com',
                merchantId
            }
        });

        if (existing) {
            throw new ConflictException('Agent with this phone/email already exists');
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
}
