/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma, LoanStatus, PaymentStatus, DeviceStatus, KycStatus, TransactionStatus, TransactionType } from '@vistalock/database';
import { PaymentProvider } from '../payments/payment.interface';
import { NotificationService } from '../notifications/notification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoanService {
    constructor(
        @Inject('PaymentProvider') private readonly paymentProvider: PaymentProvider,
        private readonly notificationService: NotificationService,
        private readonly jwtService: JwtService,
    ) { }

    async validatePartner(apiKey: string, apiSecret: string): Promise<any> {
        const partner = await prisma.loanPartner.findUnique({
            where: { apiKey }
        });

        if (!partner || !partner.apiSecret) {
            throw new UnauthorizedException('Invalid API Credentials');
        }

        // The apiSecret in DB is bcrypt-hashed — compare properly
        const isSecretValid = await bcrypt.compare(apiSecret, partner.apiSecret);
        if (!isSecretValid) {
            throw new UnauthorizedException('Invalid API Credentials');
        }

        const payload = { sub: partner.id, role: 'LOAN_PARTNER', partnerId: partner.id };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            partner: {
                id: partner.id,
                name: partner.name,
                email: partner.contactEmail,
                role: 'LOAN_PARTNER'
            }
        };
    }

    async initiateRepayment(loanId: string, amount: number): Promise<any> {
        const loan = await this.getLoan(loanId);
        // Find user email via Prisma
        const user = await prisma.user.findUnique({ where: { id: loan.userId } });
        if (!user) throw new NotFoundException('User not found');

        // Check for merchant subaccount
        const response = await this.paymentProvider.initializePayment(
            amount * 100, // Convert to Kobo
            user.email,
            { loanId },
        );
        return response;
    }

    async createLoan(data: {
        userId: string;
        deviceId: string; // This expects the Device UUID
        amount: number;
        interestRate: number;
        durationMonths: number;
    }): Promise<any> {
        // 0. Verify Customer KYC
        const customerProfile = await prisma.customerProfile.findUnique({
            where: { userId: data.userId }
        });

        if (!customerProfile) {
            throw new ForbiddenException('User is not a registered customer');
        }

        if (customerProfile.kycStatus !== KycStatus.VERIFIED) {
            throw new ForbiddenException('Customer KYC is not verified');
        }

        // Get Device details (including IMEI which is needed for the new Loan model)
        const device = await prisma.device.findUnique({
            where: { id: data.deviceId }
        });

        if (!device) {
            throw new NotFoundException('Device not found');
        }

        if (!device.imei) {
            throw new BadRequestException('Device does not have an IMEI');
        }

        // Fetch a valid product (Constraint Requirement)
        const product = await prisma.product.findFirst({ where: { merchantId: device.merchantId } });
        if (!product) {
            // Allow if strictly needed, but might fail FK. 
            // For now, let's assume one exists or we can't create loan.
            // Or try find ANY product.
            console.warn('No product found for merchant, loan creation might fail FK constraint');
        }
        const productId = product?.id || 'FALLBACK_ID'; // Will fail if FK exists and strict

        // 1. Calculate Interest & Total Amount
        const principal = Number(data.amount);
        const rate = Number(data.interestRate) / 100;
        const totalInterest = principal * rate;
        const totalAmount = principal + totalInterest;

        // 2. Generate Payments (replacing Installments)
        const monthlyAmount = totalAmount / data.durationMonths;
        const payments: any[] = [];
        const today = new Date();

        for (let i = 1; i <= data.durationMonths; i++) {
            const dueDate = new Date(today);
            dueDate.setMonth(today.getMonth() + i);
            payments.push({
                dueDate: dueDate,
                amount: monthlyAmount,
                status: PaymentStatus.PENDING,
            });
        }

        // 3. Save to DB Transaction
        // Note: New Loan model relations: userId, deviceIMEI, merchantId, productId
        const createdLoan = await prisma.loan.create({
            data: {
                userId: data.userId,
                deviceIMEI: device.imei,
                productId: productId,

                loanAmount: principal,
                interestRate: data.interestRate,
                tenure: data.durationMonths, // data.durationMonths -> tenure
                monthlyRepayment: monthlyAmount,
                totalRepayment: totalAmount,
                downPayment: 0, // Default
                outstandingAmount: totalAmount,

                status: LoanStatus.ACTIVE,

                merchantId: device.merchantId, // Get merchant from device

                payments: {
                    create: payments
                },

                // Missing required fields?
                customerPhone: customerProfile.phoneNumber || 'UNKNOWN',
                customerNIN: customerProfile.nin || 'UNKNOWN',
            } as any, // Cast to any to bypass strict type check for now if types aren't generated
            include: {
                payments: true
            }
        });

        return createdLoan;
    }

    async getLoan(id: string): Promise<any> {
        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                payments: true,
                device: true
            }
        });
        if (!loan) throw new NotFoundException('Loan not found');
        return loan;
    }

    async repayLoan(id: string, amount: number, reference?: string): Promise<any> {
        // Idempotency check
        if (reference) {
            const existingTx = await prisma.transaction.findFirst({ where: { reference } });
            if (existingTx) return { message: 'Transaction already processed', transaction: existingTx };
        }

        const loan = await this.getLoan(id);

        let remainingPayment = Number(amount);
        const updates: any[] = [];

        // Sort payments by due date
        const payments = loan.payments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        for (const payRec of payments) {
            if (remainingPayment <= 0) break;
            if (payRec.status === PaymentStatus.PAID) continue;

            const amountExpected = Number(payRec.amount);
            const amountAlreadyPaid = Number(payRec.paidAmount || 0);
            const due = amountExpected - amountAlreadyPaid;

            const pay = Math.min(due, remainingPayment);

            remainingPayment -= pay;

            const newPaidAmount = amountAlreadyPaid + pay;
            const newStatus = newPaidAmount >= amountExpected ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

            updates.push(prisma.payment.update({
                where: { id: payRec.id },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus,
                    paidDate: new Date()
                }
            }));
        }

        await prisma.$transaction(updates);

        // Check if fully paid
        const refreshedLoan = await this.getLoan(id);
        const allPaid = refreshedLoan.payments.every(p => p.status === PaymentStatus.PAID);

        if (allPaid) {
            await prisma.loan.update({ where: { id }, data: { status: LoanStatus.COMPLETED } });

            // Unlock device (using imei from loan or device relation)
            if (loan.deviceIMEI) {
                await prisma.device.update({ where: { imei: loan.deviceIMEI }, data: { status: DeviceStatus.UNLOCKED } });
            }

            // Notification
            const userProfile = await prisma.customerProfile.findUnique({ where: { userId: loan.userId } });
            if (userProfile?.phoneNumber) {
                // this.notificationService.sendDeviceUnlockAlert(userProfile.phoneNumber, loan.deviceIMEI);
            }
        }

        // 4. Create Transaction Record (Settlement)
        await prisma.transaction.create({
            data: {
                amount: amount,
                type: TransactionType.PAYMENT,
                status: TransactionStatus.SUCCESS,
                reference: reference || `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                loanId: id,
                merchantId: loan.merchantId
            }
        });

        return refreshedLoan;
    }

    // handleWebhook ... (same as before)
    async handleWebhook(event: any): Promise<boolean> {
        if (event.event !== 'charge.success') {
            return false;
        }

        const { reference, amount, metadata } = event.data;
        const loanId = metadata?.loanId;

        if (!loanId) {
            console.error('Webhook Error: Missing loanId in metadata');
            return false;
        }

        // Paystack amount is in Kobo
        const amountMajor = amount / 100;

        try {
            await this.repayLoan(loanId, amountMajor, reference);
            return true;
        } catch (error) {
            console.error('Webhook Error processing repayment:', error);
            throw error;
        }
    }

    async getLoans(merchantId?: string): Promise<any> {
        const where: any = {};
        if (merchantId) where.merchantId = merchantId; // Updated from where.device = ...

        return prisma.loan.findMany({
            where,
            include: { payments: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    // --- Partner Service Methods ---

    async getPartnerStats(partnerId: string): Promise<any> {
        // Correct logic based on Prod Schema:
        // Query Loans directly where loanPartnerId matches

        // 1. Aggregate Loan Stats
        const totalDisbursed = await prisma.loan.aggregate({
            where: { loanPartnerId: partnerId },
            _sum: { loanAmount: true }
        });

        const activeLoans = await prisma.loan.count({
            where: {
                loanPartnerId: partnerId,
                status: LoanStatus.ACTIVE
            }
        });

        // For active locks, we need to join with Device
        // But Prisma aggregate doesn't support deep relation filtering easily in all versions
        // Let's count devices that have an active loan with this partner
        // OR: Find loans with this partner AND isLocked=true (if loan tracks lock status)
        // Schema line 257: isLocked Boolean @default(false)
        const activeLocks = await prisma.loan.count({
            where: {
                loanPartnerId: partnerId,
                isLocked: true
            }
        });

        // 3. Repayment Rate
        const totalDue = await prisma.payment.aggregate({
            where: { loan: { loanPartnerId: partnerId } },
            _sum: { amount: true }
        });

        const totalPaid = await prisma.payment.aggregate({
            where: { loan: { loanPartnerId: partnerId } },
            _sum: { paidAmount: true }
        });

        const repaymentRate = totalDue._sum.amount && Number(totalDue._sum.amount) > 0
            ? (Number(totalPaid._sum.paidAmount ?? 0) || 0) / Number(totalDue._sum.amount) * 100
            : 0;

        return {
            totalDisbursed: totalDisbursed._sum.loanAmount ?? 0,
            activeLoans,
            activeLocks,
            repaymentRate: Math.round(repaymentRate * 10) / 10,
            defaultRate: 2.1,
            avgTicketSize: 0,
        };
    }

    async getPartnerMerchants(partnerId: string): Promise<any> {
        // 1. Find all distinct merchantIds that have loans with this partner
        const loans = await prisma.loan.groupBy({
            by: ['merchantId'],
            where: { loanPartnerId: partnerId },
            _sum: { loanAmount: true },
            _count: { id: true }
        });

        const merchantIds = loans.map(l => l.merchantId);

        // 2. Fetch Merchant Profiles
        const profiles = await prisma.merchantProfile.findMany({
            where: { userId: { in: merchantIds } },
            select: {
                userId: true,
                businessName: true,
                status: true,
                // Add other fields if needed
            }
        });

        // 3. Merge data
        return profiles.map(p => {
            const stats = loans.find(l => l.merchantId === p.userId);
            return {
                id: p.userId,
                name: p.businessName,
                status: p.status, // MerchantStatus enum
                riskScore: 'Medium', // Mock or calculate
                activeLoans: stats?._count.id || 0,
                totalDisbursed: Number(stats?._sum.loanAmount) || 0
            };
        });
    }

    async getRiskConfig(partnerId: string): Promise<any> {
        let config = await prisma.riskConfig.findUnique({
            where: { loanPartnerId: partnerId }
        });

        if (!config) {
            // Create default if not exists
            config = await prisma.riskConfig.create({
                data: { loanPartnerId: partnerId }
            });
        }
        return config;
    }

    async updateRiskConfig(partnerId: string, data: any): Promise<any> {
        return prisma.riskConfig.upsert({
            where: { loanPartnerId: partnerId },
            update: data,
            create: { ...data, loanPartnerId: partnerId }
        });
    }

    async getPartnerWallet(partnerId: string): Promise<any> {
        let wallet = await prisma.loanPartnerWallet.findUnique({
            where: { loanPartnerId: partnerId }
        });

        if (!wallet) {
            wallet = await prisma.loanPartnerWallet.create({
                data: { loanPartnerId: partnerId }
            });
        }

        // Fetch recent transactions (Mock for MVP if Transaction model doesn't support PartnerWallet yet)
        // We'll need to update Transaction model to link to LoanPartnerWallet in future phases.
        const transactions: any[] = [];

        return {
            ...wallet,
            transactions
        };
    }

    async getPartnerApplications(partnerId: string): Promise<any> {
        return prisma.loan.findMany({
            where: {
                loanPartnerId: partnerId,
                status: LoanStatus.PENDING
            },
            include: {
                user: {
                    include: {
                        customerProfile: true
                    }
                },
                device: true,
                merchant: {
                    include: {
                        merchantProfile: true
                    }
                },
                product: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async processLoanDecision(partnerId: string, loanId: string, decision: 'APPROVE' | 'REJECT'): Promise<any> {
        const loan = await prisma.loan.findUnique({
            where: { id: loanId }
        });

        if (!loan) throw new NotFoundException('Loan request not found');
        if (loan.loanPartnerId !== partnerId) throw new ForbiddenException('Not authorized for this loan');
        if (loan.status !== LoanStatus.PENDING) throw new BadRequestException('Loan is not in pending state');

        let newStatus: LoanStatus;
        if (decision === 'APPROVE') {
            newStatus = LoanStatus.ACTIVE;
        } else if (decision === 'REJECT') {
            newStatus = LoanStatus.CANCELLED; // Using CANCELLED as REJECTED equivalent
        } else {
            throw new BadRequestException('Invalid decision');
        }

        return prisma.loan.update({
            where: { id: loanId },
            data: {
                status: newStatus,
                approvedAt: newStatus === LoanStatus.ACTIVE ? new Date() : undefined
            }
        });
    }

    async getPartnerCommissions(partnerId: string): Promise<any> {
        // Fetch all loans for this partner that have an agent associated
        const loans = await prisma.loan.findMany({
            where: {
                loanPartnerId: partnerId,
                agentId: { not: null }
            },
            include: {
                merchant: {
                    select: {
                        id: true,
                        merchantProfile: { select: { businessName: true } }
                    }
                },
                // We need agent details. agentId is a String, we need to manually fetch or use relation if exists.
                // Assuming agentId maps to a User.
            },
            orderBy: { createdAt: 'desc' }
        });

        // Since Agent relation might not be strictly defined in Prisma schema for Loan yet (based on previous view),
        // we'll fetch agents manually or assume logic.
        // Let's try to fetch user details for the agents.
        const agentIds = [...new Set(loans.map(l => l.agentId).filter(id => id !== null) as string[])];

        const agents = await prisma.user.findMany({
            where: { id: { in: agentIds } },
            select: {
                id: true,
                email: true,
                agentProfile: {
                    select: { fullName: true, phoneNumber: true }
                }
            }
        });

        return loans.map(loan => {
            const agent = agents.find(a => a.id === loan.agentId);
            const commissionRate = 0.01; // 1% default
            const commissionAmount = loan.loanAmount * commissionRate;

            return {
                id: `COMM-${loan.id}`,
                loanId: loan.id,
                agentName: agent?.agentProfile?.fullName || agent?.email || 'Unknown Agent',
                merchantName: loan.merchant?.merchantProfile?.businessName || 'Unknown Merchant',
                loanAmount: loan.loanAmount,
                commissionAmount: commissionAmount,
                status: loan.status === LoanStatus.COMPLETED ? 'PAID' : 'PENDING',
                createdAt: loan.createdAt
            };
        });
    }

    async rotateApiKey(partnerId: string): Promise<any> {
        // Generate new credentials
        // In a real app, use crypto.randomBytes
        const newKey = `pk_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const newSecret = `sk_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const hashedSecret = await bcrypt.hash(newSecret, 10);

        await prisma.loanPartner.update({
            where: { id: partnerId },
            data: {
                apiKey: newKey,
                apiSecret: hashedSecret
            }
        });

        return { apiKey: newKey, apiSecret: newSecret };
    }

    async updateWebhook(partnerId: string, webhookUrl: string, webhookSecret?: string): Promise<any> {
        return prisma.loanPartner.update({
            where: { id: partnerId },
            data: {
                webhookUrl,
                webhookSecret: webhookSecret || undefined
            }
        });
    }

    async getIntegrationDetails(partnerId: string): Promise<any> {
        const partner = await prisma.loanPartner.findUnique({
            where: { id: partnerId },
            select: { apiKey: true, webhookUrl: true, webhookSecret: true }
        });
        if (!partner) throw new NotFoundException('Partner not found');
        return partner;
    }

    async getPartnerTeam(partnerId: string): Promise<any> {
        const team = await prisma.loanPartnerUser.findMany({
            where: { loanPartnerId: partnerId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });

        return team.map(member => ({
            id: member.id,
            userId: member.userId,
            name: member.user.email.split('@')[0], // Fallback name
            email: member.user.email,
            role: member.role,
            status: member.isActive ? 'ACTIVE' : 'INACTIVE',
            joinedAt: member.createdAt
        }));
    }

    async inviteTeamMember(partnerId: string, email: string, role: string): Promise<any> {
        // 1. Find or Create User
        let user = await prisma.user.findUnique({ where: { email } });
        let isNewUser = false;

        if (!user) {
            // Create pending user
            const hashedPassword = await bcrypt.hash('Vistalock123!', 10); // Default password
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'LOAN_PARTNER',
                    isActive: true, // Auto-active for now
                }
            });
            isNewUser = true;
        }

        // 2. Check overlap
        const existingLink = await prisma.loanPartnerUser.findUnique({
            where: { userId: user.id }
        });

        if (existingLink) {
            if (existingLink.loanPartnerId === partnerId) {
                throw new BadRequestException('User is already in your team');
            } else {
                throw new BadRequestException('User belongs to another organization');
            }
        }

        // 3. Create Link
        const newMember = await prisma.loanPartnerUser.create({
            data: {
                userId: user.id,
                loanPartnerId: partnerId,
                role: role as any, // Cast to LoanPartnerRole
                isActive: true
            }
        });

        return { ...newMember, isNewUser };
    }
}
