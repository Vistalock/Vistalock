
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, ApplicationStatus, Role, BusinessType, MerchantStatus } from '@vistalock/database';
import { EmailService } from '../email/email.service';
import { CreditServiceAdapter } from '../integration/credit-service.adapter';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { ExternalVerificationService } from '../integration/external-verification.service';

@Injectable()
export class MerchantApplicationService {
    private readonly logger = new Logger(MerchantApplicationService.name);
    private prisma = new PrismaClient();
    private idempotencyCache = new Map<string, any>(); // Cache for idempotency

    constructor(
        private emailService: EmailService,
        private creditAdapter: CreditServiceAdapter,
        private externalVerification: ExternalVerificationService
    ) { }

    /**
     * Check for duplicate email, phone, or business name
     * Used by frontend before submission
     */
    async checkDuplicates(email: string, phone: string, businessName: string) {
        const [emailExists, phoneExists, businessExists] = await Promise.all([
            this.prisma.merchantApplication.findFirst({
                where: { email, deletedAt: null },
                select: { id: true }
            }),
            this.prisma.merchantApplication.findFirst({
                where: { phone, deletedAt: null },
                select: { id: true }
            }),
            this.prisma.merchantApplication.findFirst({
                where: {
                    businessName: { equals: businessName, mode: 'insensitive' },
                    deletedAt: null
                },
                select: { id: true }
            })
        ]);

        return {
            emailExists: !!emailExists,
            phoneExists: !!phoneExists,
            businessExists: !!businessExists,
            canProceed: !emailExists && !phoneExists && !businessExists
        };
    }

    async submitApplication(data: any, idempotencyKey?: string) {
        // Check idempotency cache
        if (idempotencyKey && this.idempotencyCache.has(idempotencyKey)) {
            this.logger.log(`⚠️ Duplicate request detected with idempotency key: ${idempotencyKey}`);
            return this.idempotencyCache.get(idempotencyKey);
        }
        // ===== DUPLICATE PREVENTION CHECKS =====
        this.logger.log(`Checking for duplicates: ${data.email}`);

        // 1. Check for duplicate email (excluding soft-deleted)
        const existingEmail = await this.prisma.merchantApplication.findFirst({
            where: {
                email: data.email,
                deletedAt: null // Exclude soft-deleted
            }
        });
        if (existingEmail) {
            throw new Error('An application with this email already exists. Please use a different email or contact support.');
        }

        // 2. Check for duplicate phone (excluding soft-deleted)
        const existingPhone = await this.prisma.merchantApplication.findFirst({
            where: {
                phone: data.phone,
                deletedAt: null
            }
        });
        if (existingPhone) {
            throw new Error('An application with this phone number already exists.');
        }

        // 3. Check for duplicate business name (excluding soft-deleted)
        const existingBusiness = await this.prisma.merchantApplication.findFirst({
            where: {
                businessName: {
                    equals: data.businessName,
                    mode: 'insensitive' // Case-insensitive match
                },
                deletedAt: null
            }
        });
        if (existingBusiness) {
            throw new Error('An application with this business name already exists. Please use a unique business name.');
        }

        // 4. Check for duplicate CAC number (if provided, excluding soft-deleted)
        if (data.cacNumber) {
            const existingCAC = await this.prisma.merchantApplication.findFirst({
                where: {
                    cacNumber: data.cacNumber,
                    deletedAt: null
                }
            });
            if (existingCAC) {
                throw new Error('An application with this CAC number already exists.');
            }
        }

        // 5. Check for duplicate NIN/BVN
        if (data.directors && data.directors.length > 0) {
            const director = data.directors[0];

            if (director.nin) {
                const existingNIN = await this.prisma.merchantApplication.findFirst({
                    where: {
                        directors: {
                            path: ['0', 'nin'],
                            equals: director.nin
                        },
                        deletedAt: null
                    }
                });
                if (existingNIN) {
                    throw new Error('An application with this NIN already exists.');
                }
            }

            if (director.bvn) {
                const existingBVN = await this.prisma.merchantApplication.findFirst({
                    where: {
                        directors: {
                            path: ['0', 'bvn'],
                            equals: director.bvn
                        },
                        deletedAt: null
                    }
                });
                if (existingBVN) {
                    throw new Error('An application with this BVN already exists.');
                }
            }
        }

        // ===== AUTOMATED PRE-SCREENING (3rd Party Check) =====
        this.logger.log(`Running automated pre-screening for: ${data.email}`);

        // A. CAC Validation
        if (data.cacNumber) {
            const cacResult = await this.externalVerification.verifyCAC(data.cacNumber);
            if (!cacResult.isValid) {
                throw new Error(`CAC Verification Failed: ${cacResult.reason || 'Invalid RC Number'}`);
            }
            this.logger.log(`✅ CAC Verified: ${cacResult.companyName}`);
        }

        // B. Bank Account Validation
        if (data.bankDetails?.accountNumber && data.bankDetails?.bankName) {
            const bankResult = await this.externalVerification.verifyBankAccount(
                data.bankDetails.accountNumber,
                data.bankDetails.bankName
            );
            if (!bankResult.isValid) {
                throw new Error(`Bank Account Verification Failed: ${bankResult.reason || 'Invalid details'}`);
            }
            this.logger.log(`✅ Bank Account Verified: ${bankResult.accountName}`);
        }

        this.logger.log(`No duplicates or validation errors found. Creating application for: ${data.email}`);

        // ===== CREATE APPLICATION =====
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
            // NEW: Notify Ops Admin
            await this.emailService.sendOpsAdminNotification(data.businessName);
        } catch (error) {
            console.error('Failed to send emails:', error);
            // Don't fail the application submission if email fails
        }

        // Cache result for idempotency (5 minutes)
        if (idempotencyKey) {
            this.idempotencyCache.set(idempotencyKey, application);
            setTimeout(() => this.idempotencyCache.delete(idempotencyKey), 300000);
            this.logger.log(`✅ Cached application with idempotency key: ${idempotencyKey}`);
        }

        return application;
    }

    async getApplications() {
        return this.prisma.merchantApplication.findMany({
            // @ts-ignore: deletedAt exists in schema
            where: { deletedAt: null }, // Exclude soft-deleted applications
            orderBy: { createdAt: 'desc' },
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

        // Generate unique rcNumber if cacNumber is missing
        const rcNumber = application.cacNumber || `TEMP-${application.id.substring(0, 8)}`;

        // Check if merchant profile with this rcNumber already exists
        const existingMerchantByRc = await this.prisma.merchantProfile.findUnique({
            where: { rcNumber },
            include: { user: true }
        });

        if (existingMerchantByRc) {
            throw new Error('A merchant with this registration number already exists. If this is your account, please use the login page instead.');
        }

        // Create User + MerchantProfile
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: application.email,
                    password: hashedPassword,
                    role: Role.MERCHANT,
                    merchantProfile: {
                        create: {
                            businessName: application.businessName,
                            businessType: application.businessType as BusinessType || BusinessType.SOLE_PROPRIETORSHIP,
                            rcNumber: rcNumber,
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
        } catch (error) {
            console.error('Merchant activation error:', error);

            // Check if it's a duplicate email error
            if (error.code === 'P2002') {
                if (error.meta?.target?.includes('email')) {
                    throw new Error('This email is already registered. Please use the login page instead.');
                }
                if (error.meta?.target?.includes('rcNumber')) {
                    throw new Error('A merchant with this registration number already exists.');
                }
            }

            throw new Error(`Failed to activate merchant: ${error.message}`);
        }
    }

    async reviewByOps(id: string, adminId: string, reviewData: any) {
        // Ops Admin Action: Pass to Risk
        const app = await this.prisma.merchantApplication.findUnique({ where: { id } });
        if (!app) throw new Error('Application not found');

        // @ts-ignore: reviews exists in schema
        const currentReviews = (app.reviews as any[]) || [];
        const newReview = {
            stage: 'OPS',
            adminId,
            timestamp: new Date(),
            ...reviewData
        };

        const updatedApp = await this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.OPS_REVIEWED,
                processedBy: adminId,
                // @ts-ignore: Reviews field exists in schema but types might be stale
                reviews: [...currentReviews, newReview]
            }
        });

        // NEW: Notify Risk Admin
        try {
            await this.emailService.sendRiskAdminNotification(app.businessName);
        } catch (e) {
            this.logger.error(`Failed to notify Risk Admin: ${e.message}`);
        }

        return updatedApp;
    }

    /**
     * Automated Risk Assessment using Credit Service
     * Can be triggered after Ops Review or manually
     */
    async autoAssessRisk(id: string, systemAdminId: string = 'SYSTEM_AUTO_RISK') {
        const app = await this.prisma.merchantApplication.findUnique({ where: { id } });
        if (!app) throw new Error('Application not found');

        this.logger.log(`Running automated risk assessment for ${app.businessName}`);

        // Call Credit Service
        const creditResult = await this.creditAdapter.assessMerchantRisk(app);

        // Store result in reviews
        const currentReviews = (app.reviews as any[]) || [];
        const autoReview = {
            stage: 'RISK_AUTO',
            adminId: systemAdminId,
            timestamp: new Date(),
            creditScore: creditResult.score,
            decision: creditResult.decision,
            reasons: creditResult.reasons,
            automated: true
        };

        // Decision Logic
        if (creditResult.decision === 'APPROVED' && creditResult.score >= 700) {
            // Auto-approve to RISK_REVIEWED
            this.logger.log(`Auto-approving risk for ${app.businessName} (Score: ${creditResult.score})`);
            const updatedApp = await this.prisma.merchantApplication.update({
                where: { id },
                data: {
                    status: ApplicationStatus.RISK_REVIEWED,
                    processedBy: systemAdminId,
                    reviews: [...currentReviews, autoReview]
                }
            });
            // NEW: Notify Super Admin (Auto-Approved)
            try {
                await this.emailService.sendSuperAdminNotification(app.businessName);
            } catch (e) {
                this.logger.error(`Failed to notify Super Admin: ${e.message}`);
            }
            return updatedApp;
        } else if (creditResult.decision === 'REJECTED') {
            // Auto-reject
            this.logger.warn(`Auto-rejecting ${app.businessName} (Score: ${creditResult.score})`);
            return this.rejectApplication(id, systemAdminId, `Automated Risk Assessment: ${creditResult.reasons?.join(', ')}`);
        } else {
            // Manual review required
            this.logger.log(`Flagging ${app.businessName} for manual risk review`);

            // NEW: Notify Risk Admin (Manual Review Needed)
            try {
                await this.emailService.sendRiskAdminNotification(app.businessName);
            } catch (e) {
                this.logger.error(`Failed to notify Risk Admin: ${e.message}`);
            }

            return this.prisma.merchantApplication.update({
                where: { id },
                data: {
                    reviews: [...currentReviews, { ...autoReview, requiresManualReview: true }]
                }
            });
        }
    }

    async reviewByRisk(id: string, adminId: string, reviewData: any) {
        // Risk Admin Action: Pass to Super Admin
        const app = await this.prisma.merchantApplication.findUnique({ where: { id } });
        if (!app) throw new Error('Application not found');

        // @ts-ignore: reviews exists in schema
        const currentReviews = (app.reviews as any[]) || [];
        const newReview = {
            stage: 'RISK',
            adminId,
            timestamp: new Date(),
            ...reviewData
        };

        const updatedApp = await this.prisma.merchantApplication.update({
            where: { id },
            data: {
                status: ApplicationStatus.RISK_REVIEWED,
                processedBy: adminId,
                // @ts-ignore: Reviews field exists in schema but types might be stale
                reviews: [...currentReviews, newReview]
            }
        });

        // NEW: Notify Super Admin (Manual Risk Review Complete)
        try {
            await this.emailService.sendSuperAdminNotification(app.businessName);
        } catch (e) {
            this.logger.error(`Failed to notify Super Admin: ${e.message}`);
        }

        return updatedApp;
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

    async softDeleteApplication(id: string) {
        // Soft delete - mark as deleted but keep data
        return this.prisma.merchantApplication.update({
            where: { id },
            // @ts-ignore: deletedAt exists in schema
            data: { deletedAt: new Date() }
        });
    }

    async deleteApplication(id: string) {
        // Hard delete - permanently remove from database
        return this.prisma.merchantApplication.delete({
            where: { id }
        });
    }
}
