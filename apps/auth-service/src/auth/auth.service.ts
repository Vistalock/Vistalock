import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { StorageService } from '../storage/storage.service';
import * as bcrypt from 'bcryptjs';

// import { prisma } from '@vistalock/database';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private storageService: StorageService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        try {
            console.log(`🔍 Attempting login for: ${email}`);
            const user = await this.usersService.findOne(email);

            if (!user) {
                console.log(`❌ User not found: ${email}`);
                return null;
            }

            console.log(`✅ User found: ${email}, role: ${user.role}, hasPassword: ${!!user.password}`);

            if (user && user.password && (await bcrypt.compare(pass, user.password))) {
                if (user.isActive === false) {
                    console.log(`❌ Account suspended: ${email}`);
                    throw new UnauthorizedException('Account is suspended. Contact Single-Point Authority.');
                }
                console.log(`✅ Password valid for: ${email}`);
                const { password, ...result } = user;
                return result;
            }

            console.log(`❌ Invalid password for: ${email}`);
            return null;
        } catch (error) {
            console.error(`❌ Error in validateUser for ${email}:`, error);
            throw error;
        }
    }

    async login(user: any) {
        let tenantId = null;

        if (user.role === 'MERCHANT') {
            tenantId = user.id;
        } else if (user.role === 'MERCHANT_AGENT' || user.role === 'CUSTOMER') {
            tenantId = user.merchantId;
        }

        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            tenantId: tenantId
        };

        return {
            access_token: this.jwtService.sign(payload),
            role: user.role,
            tenantId: tenantId
        };
    }

    async register(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.usersService.create({
            email: data.email,
            password: hashedPassword,
            role: data.role || 'CUSTOMER',
        });
    }

    async generateApiKey(userId: string): Promise<string> {
        const apiKey = 'vl_' + randomBytes(16).toString('hex');
        await this.usersService.update(userId, { apiKey });
        return apiKey;
    }

    async validateApiKey(apiKey: string): Promise<any> {
        return this.usersService.findByApiKey(apiKey);
    }

    async upsertMerchantProfile(userId: string, data: any) {
        return this.usersService.upsertMerchantProfile(userId, data);
    }

    async getMerchantProfile(userId: string) {
        return this.usersService.getMerchantProfile(userId);
    }

    async deleteUser(id: string) {
        return this.usersService.deleteUser(id);
    }

    async createAgent(merchantId: string, data: any) {
        let hashedPassword: string | null = null;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }
        return this.usersService.createAgent(merchantId, { ...data, password: hashedPassword });
    }

    async getAgents(merchantId: string) {
        return this.usersService.getAgents(merchantId);
    }

    async getAgentProfileByUserId(userId: string) {
        return this.usersService.getAgentProfileByUserId(userId); // Need to implement in UsersService
    }

    async getInternalUsers() {
        return this.usersService.findAllInternal();
    }



    async getDashboardStats() {
        // ... functionality temporarily disabled due to global prisma client issues ...
        return {
            totalMerchants: 0,
            totalDevices: 0,
            lockedDevices: 0,
            activeLoans: 0,
            totalRevenue: 0
        };
    }

    async suspendUser(userId: string, isActive: boolean) {
        return this.usersService.update(userId, { isActive });
    }

    async updateUserRole(userId: string, role: any) {
        return this.usersService.update(userId, { role });
    }

    async resetPassword(userId: string) {
        const tempPassword = randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        await this.usersService.update(userId, { password: hashedPassword });
        return tempPassword;
    }
    async generateSudoToken(userId: string, pass: string): Promise<string | null> {
        const user = await this.usersService.findOneById(userId);
        if (!user || !user.password) return null;

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) return null;

        const payload = { sub: user.id, scope: 'sudo' };
        return this.jwtService.sign(payload, { expiresIn: '5m' });
    }

    async getFinancialAnalytics() {
        // disabled
        return { totalRevenue: 0, activeLoans: 0, totalLoanVolume: 0, revenueTrend: [] };
    }

    async getRiskAnalytics() {
        // disabled
        return { totalDevices: 0, lockedDevices: 0, activeLoans: 0, defaultedLoans: 0, lockRate: 0, defaultRate: 0, deviceHealth: [] };
    }
    async getMerchantStats(merchantId: string) {
        // disabled
        return { totalDevices: 0, lockedDevices: 0, activeLoans: 0, totalRevenue: 0, gracePeriod: 0, repaymentsDue: 0, overdue: 0, defaultRate: 0 };
    }
    async getTransactions(merchantId: string) {
        return [];
    }

    async getAnalytics(merchantId: string) {
        return { deviceUtilization: [], loanPerformance: [], repaymentTrend: [] };
    }



    async inviteAgent(merchantId: string, data: any) {
        // 1. Create the agent user (Pending status)
        // If agent already exists by email, handle gracefully or update
        // user creation logic is handled in createAgent
        const agent = await this.usersService.createAgent(merchantId, data);

        // 2. Generate secure token
        const activationToken = randomBytes(32).toString('hex');
        const activationExpiresAt = new Date();
        activationExpiresAt.setHours(activationExpiresAt.getHours() + 24); // 24 hour expiry

        // 3. Save token to AgentProfile
        await this.usersService.updateAgentProfile(agent.id, {
            activationToken,
            activationExpiresAt
        });

        // 4. Return the link (In production, this would send SMS/Email)
        const activationLink = `vistalock://activate?token=${activationToken}`;

        return {
            message: 'Agent invited successfully',
            agentId: agent.id,
            activationLink, // Returning here for demo/API response purposes
            expiresIn: '24h'
        };
    }

    async activateAgent(data: any) {
        const { token, otp, password, deviceId } = data;

        // 1. Validate OTP (Mock for now - '123456')
        if (otp !== '123456') {
            throw new UnauthorizedException('Invalid OTP');
        }

        // 2. Find agent by token
        const agentProfile = await this.usersService.findAgentByToken(token);
        if (!agentProfile) {
            throw new UnauthorizedException('Invalid or expired activation token');
        }

        // 3. Check expiry
        if (agentProfile.activationExpiresAt && new Date() > agentProfile.activationExpiresAt) {
            throw new UnauthorizedException('Activation token expired');
        }

        if (agentProfile.isActivated) {
            throw new UnauthorizedException('Agent already activated');
        }

        // 4. Update User (Password) and AgentProfile (Device Binding + Status)
        const hashedPassword = await bcrypt.hash(password, 10);

        await this.usersService.update(agentProfile.userId, {
            password: hashedPassword,
            isActive: true
        });

        await this.usersService.updateAgentProfileByUserId(agentProfile.userId, {
            deviceId: deviceId,
            isActivated: true,
            status: 'ACTIVE',
            activationToken: null, // Invalidate token
            activationExpiresAt: null
        });

        return {
            message: 'Agent activated successfully',
            deviceId: deviceId
        };
    }

    async getAgentDashboardStats(userId: string) {
        return this.usersService.getAgentStats(userId);
    }

    async generateCustomerOtp(phoneNumber: string) {
        // In production: Generate random 6-digit code, save to Redis/DB with expiry, send via SMS
        console.log(`[MOCK] Generating OTP for customer ${phoneNumber}: 123456`);
        return {
            message: 'OTP sent successfully',
            // validFor: '10m'
        };
    }

    async validateCustomerOtp(phoneNumber: string, otp: string) {
        // In production: Check against Redis/DB
        if (otp === '123456') {
            return {
                valid: true,
                message: 'Phone number verified'
            };
        }
        throw new UnauthorizedException('Invalid OTP');
    }

    async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
        // Alias for validateCustomerOtp for consistency
        try {
            await this.validateCustomerOtp(phoneNumber, otp);
            return true;
        } catch {
            return false;
        }
    }

    async storeOTP(phoneNumber: string, otp: string) {
        // Mock store
        console.log(`Stored OTP for ${phoneNumber}: ${otp}`);
    }

    async findByPhoneNumber(phoneNumber: string) {
        // Assume usersService has this, or mock find
        // return this.usersService.findByPhone(phoneNumber); 
        // fallback mock
        const prisma = new (await import('@vistalock/database')).PrismaClient();
        try {
            return await prisma.user.findFirst({ where: { customerProfile: { phoneNumber } } });
        } finally {
            await prisma.$disconnect();
        }
    }

    async createCustomerUser(phoneNumber: string) {
        const prisma = new (await import('@vistalock/database')).PrismaClient();
        try {
            // Create user and profile transactionally
            return await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: `${phoneNumber}@vistalock.customer`, // Placeholder email
                        role: 'CUSTOMER',
                        isActive: true
                    }
                });
                await tx.customerProfile.create({
                    data: {
                        userId: user.id,
                        phoneNumber: phoneNumber
                    }
                });
                return user;
            });
        } finally {
            await prisma.$disconnect();
        }
    }

    async generateToken(user: any) {
        const payload = { sub: user.id, role: user.role };
        return this.jwtService.sign(payload);
    }

    async storeIDVerification(userId: string, type: string, value: string, result: any) {
        // Mock storage of verification result
        console.log(`Stored ID Verification for ${userId}: ${type} - ${value}`, result);
    }

    async checkDuplicateCustomer(nin: string | undefined, phoneNumber: string | undefined) {
        const prisma = new (await import('@vistalock/database')).PrismaClient();
        try {
            if (phoneNumber) {
                const exists = await prisma.customerProfile.findUnique({ where: { phoneNumber } });
                if (exists) return true;
            }
            // NIN check not in CustomerProfile in schema? Wait, schema has NIN in CustomerProfile
            if (nin) {
                const exists = await prisma.customerProfile.findUnique({ where: { nin } });
                if (exists) return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            await prisma.$disconnect();
        }
    }

    async storeCreditScore(userId: string, scoreData: any) {
        const prisma = new (await import('@vistalock/database')).PrismaClient();
        try {
            await prisma.customerProfile.update({
                where: { userId },
                data: { creditScore: scoreData.score }
            });
        } finally {
            await prisma.$disconnect();
        }
    }

    async createLoan(data: any) {
        // Proxy to direct DB creation for now, ideally calls LoanService
        const prisma = new (await import('@vistalock/database')).PrismaClient();
        try {
            // Mapping input to new Loan model
            // Input: customerId, productId, deviceIMEI, loanAmount, interestRate?, tenure...
            // Ensure product exists
            const product = await prisma.product.findUnique({ where: { id: data.productId } });
            if (!product) throw new Error('Product not found');

            // Fetch device to get merchant
            const device = await prisma.device.findUnique({ where: { imei: data.deviceIMEI } });

            // Create Payment Schedule (Simple Version)
            const totalAmount = data.loanAmount; // Assume confirmed includes interest? Or calc?
            // createLoan args from controller: loanAmount: loanPlan.totalRepayment - downPayment
            // So this is principal + interest
            const monthly = data.monthlyRepayment;

            const payments: any[] = [];
            for (let i = 1; i <= data.tenure; i++) {
                const d = new Date();
                d.setMonth(d.getMonth() + i);
                payments.push({
                    dueDate: d,
                    amount: monthly,
                    status: 'PENDING'
                });
            }

            return await prisma.loan.create({
                data: {
                    userId: data.customerId,
                    deviceIMEI: data.deviceIMEI,
                    productId: data.productId,
                    merchantId: device?.merchantId || product.merchantId, // Fallback

                    loanAmount: data.loanAmount, // This is technically "Principal" but controller passes total-down. 
                    // Let's assume data.loanAmount is what is financed.
                    downPayment: data.downPayment,
                    monthlyRepayment: data.monthlyRepayment,
                    tenure: data.tenure,
                    interestRate: 0, // Placeholder
                    totalRepayment: (data.monthlyRepayment * data.tenure) + data.downPayment,
                    outstandingAmount: (data.monthlyRepayment * data.tenure), // Owe everything initially?

                    status: data.status || 'PENDING',

                    customerPhone: 'UNKNOWN', // Should update schema to make optional or fetch
                    customerNIN: 'UNKNOWN',

                    payments: {
                        create: payments
                    }
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }
    async processOnboarding(agentId: string, body: any, files: any) {
        // 1. Process Files - Upload to Storage
        const { idCardUrl, selfieUrl } = await this.storageService.uploadKycDocuments(
            files.idCard[0],
            files.selfie[0]
        );

        console.log('Uploaded Files:', { idCardUrl, selfieUrl });

        // 2. Extract Customer & Device Data
        // Body might be nested or flat depending on how FormData sends it.
        // Usually FormData sends strings, so we might need to JSON.parse if we sent stringified JSON,
        // or access fields directly if sent as `customer[firstName]`.
        // For simplicity in this iteration, let's assume flat or basic parsing.

        const customerData = typeof body.customer === 'string' ? JSON.parse(body.customer) : body.customer;
        const deviceData = typeof body.device === 'string' ? JSON.parse(body.device) : body.device;
        const loanData = typeof body.loan === 'string' ? JSON.parse(body.loan) : body.loan;

        console.log('Processed Onboarding Data:', { customerData, deviceData, loanData });

        // 3. Call UsersService to persist everything transactionally
        // We need to resolve agent's merchantId first (if agentId is passed)
        // Note: The caller (controller) passes req.user.userId as agentId.
        const agent = await this.usersService.findOneById(agentId);
        if (!agent) throw new UnauthorizedException('Agent not found');
        const merchantId = agent.merchantId;
        if (!merchantId) throw new UnauthorizedException('Agent is not linked to a merchant');

        const result = await this.usersService.onboardCustomer(
            agentId,
            merchantId,
            customerData,
            deviceData,
            loanData,
            { idCardUrl, selfieUrl }
        );

        return {
            success: true,
            message: 'Application submitted successfully',
            applicationId: result.loanId, // Use loanId or customerId
            status: 'PENDING_REVIEW' // or result.status
        };
    }

    /**
     * Bind device to agent on first login
     */
    async bindAgentDevice(userId: string, deviceId: string) {
        return this.usersService.updateAgentProfileByUserId(userId, {
            deviceId,
            lastLoginAt: new Date()
        });
    }

    /**
     * Log agent login attempt
     */
    async logAgentLogin(userId: string, deviceId: string | null, ipAddress: string | null, success: boolean, failReason: string | null) {
        const prisma = new (await import('@vistalock/database')).PrismaClient();
        try {
            await prisma.agentLoginLog.create({
                data: {
                    userId,
                    deviceId,
                    ipAddress,
                    success,
                    failReason
                }
            });
        } finally {
            await prisma.$disconnect();
        }
    }

}
