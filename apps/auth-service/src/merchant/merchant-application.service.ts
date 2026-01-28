
import { Injectable } from '@nestjs/common';
import { PrismaClient, ApplicationStatus, Role, BusinessType, MerchantStatus } from '@vistalock/database';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MerchantApplicationService {
    private prisma = new PrismaClient();

    constructor(private emailService: EmailService) { }

    async submitApplication(data: any) {
        const application = await this.prisma.merchantApplication.create({
            data: {
                // 1. Business Info
                businessName: data.businessName,
                tradingName: data.tradingName,
                businessType: data.businessType,
                cacNumber: data.cacNumber, // Optional
                dateOfIncorporation: data.dateOfIncorporation ? new Date(data.dateOfIncorporation) : undefined,
                natureOfBusiness: data.natureOfBusiness,
                website: data.website,

                // 2. Contact & Address
                contactName: data.contactName,
                email: data.email,
                phone: data.phone,
                businessAddress: data.businessAddress,
                operatingAddress: data.operatingAddress,

                // 3-9. Complex Data
                directors: data.directors || [],
                signatories: data.signatories || [],
                bankDetails: data.bankDetails || {},
                operations: data.operations || {},
                deviceDetails: data.deviceDetails || {}, // Comprehensive device info
                agentDetails: data.agentDetails || {},
                documents: data.documents || {},
                compliance: data.compliance || {},

                status: ApplicationStatus.PENDING
            }
        });

        // Send confirmation email
        try {
            await this.emailService.sendApplicationConfirmation(
                data.email,
                data.businessName
            );
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
            // Don't fail the application submission if email fails
        }

        return application;
    }

    async getApplications() {
        return this.prisma.merchantApplication.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async getApplication(id: string) {
        return this.prisma.merchantApplication.findUnique({
            where: { id }
        });
    }

    async approveApplication(id: string, adminId: string) {
        const application = await this.prisma.merchantApplication.findUnique({
            where: { id }
        });

        if (!application) {
            throw new Error('Application not found');
        }

        if (application.status === ApplicationStatus.APPROVED) {
            throw new Error('Application already approved');
        }

        // Generate activation token (valid for 7 days)
        const activationToken = crypto.randomBytes(32).toString('hex');
        const activationExpiresAt = new Date();
        activationExpiresAt.setDate(activationExpiresAt.getDate() + 7);

        // Update application status and store activation token
        const updatedApplication = await this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.APPROVED,
                processedBy: adminId,
                // Store activation token in documents field temporarily
                documents: {
                    ...(typeof application.documents === 'object' ? application.documents : {}),
                    activationToken,
                    activationExpiresAt: activationExpiresAt.toISOString()
                }
            }
        });

        // Send approval email with activation link
        try {
            await this.emailService.sendApprovalEmail(
                application.email,
                application.businessName,
                activationToken
            );
        } catch (error) {
            console.error('Failed to send approval email:', error);
        }

        return updatedApplication;
    }

    async activateMerchant(token: string, password: string) {
        // Find application with matching token
        const applications = await this.prisma.merchantApplication.findMany({
            where: { status: ApplicationStatus.APPROVED }
        });

        const application = applications.find(app => {
            const docs = app.documents as any;
            return docs?.activationToken === token;
        });

        if (!application) {
            throw new Error('Invalid or expired activation token');
        }

        // Check if token is expired
        const docs = application.documents as any;
        const expiresAt = new Date(docs.activationExpiresAt);
        if (expiresAt < new Date()) {
            throw new Error('Activation token has expired');
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: application.email },
            include: { merchantProfile: true }
        });

        if (existingUser?.merchantProfile) {
            throw new Error('Merchant account already activated');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User + MerchantProfile
        const user = await this.prisma.user.create({
            data: {
                email: application.email,
                password: hashedPassword,
                role: Role.MERCHANT,
                merchantProfile: {
                    create: {
                        businessName: application.businessName,
                        businessType: application.businessType as BusinessType || BusinessType.SOLE_PROPRIETORSHIP,
                        rcNumber: application.cacNumber || application.businessName, // Fallback
                        businessAddress: application.businessAddress,
                        operatingAddress: application.operatingAddress,
                        directorName: application.contactName,
                        directorPhone: application.phone,
                        status: MerchantStatus.APPROVED,
                        agreementsSigned: true,
                        // Extract bank details from JSON
                        bankName: (application.bankDetails as any)?.bankName,
                        accountNumber: (application.bankDetails as any)?.accountNumber,
                        accountName: (application.bankDetails as any)?.accountName,
                    }
                }
            },
            include: { merchantProfile: true }
        });

        return { success: true, user };
    }

    async reviewByOps(id: string, adminId: string) {
        // Ops Admin Action: Pass to Risk
        return this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.OPS_REVIEWED,
                processedBy: adminId
            }
        });
    }

    async reviewByRisk(id: string, adminId: string) {
        // Risk Admin Action: Pass to Super Admin
        return this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.RISK_REVIEWED,
                processedBy: adminId
            }
        });
    }

    async rejectApplication(id: string, adminId: string, reason: string) {
        const application = await this.prisma.merchantApplication.findUnique({
            where: { id }
        });

        if (!application) {
            throw new Error('Application not found');
        }

        const updatedApplication = await this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.REJECTED,
                processedBy: adminId,
                rejectionReason: reason
            }
        });

        // Send rejection email
        try {
            await this.emailService.sendRejectionEmail(
                application.email,
                application.businessName,
                reason
            );
        } catch (error) {
            console.error('Failed to send rejection email:', error);
        }

        return updatedApplication;
    }

    async deleteApplication(id: string) {
        return this.prisma.merchantApplication.delete({
            where: { id }
        });
    }
}
