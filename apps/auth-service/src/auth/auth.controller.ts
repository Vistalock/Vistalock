import { Controller, Request, Post, UseGuards, Body, Get, UnauthorizedException, Param, UseInterceptors, UploadedFiles, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { SudoGuard } from './sudo.guard';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private auditService: AdminAuditService
    ) { }

    @Post('login')
    async login(@Body() body: LoginDto, @Request() req: any) {
        console.log(`Debug Login Attempt: ${body.email}`);
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            console.log('Debug Login Fail: Invalid credentials or user not found');
            throw new UnauthorizedException('Invalid credentials');
        }

        // Enforce Device Binding for Agents (Strict)
        if (user.role === 'MERCHANT_AGENT') {
            const ipAddress = req.ip || req.connection?.remoteAddress || null;

            try {
                if (!body.deviceId) {
                    console.warn(`[Security] Agent ${user.email} attempted login without deviceId`);
                    await this.authService.logAgentLogin(user.id, null, ipAddress, false, 'Device ID required');
                    throw new UnauthorizedException('Device ID is required for agent access');
                }

                const profile = await this.authService.getAgentProfileByUserId(user.id);

                if (!profile) {
                    console.warn(`[Security] Agent ${user.email} has no agent profile`);
                    await this.authService.logAgentLogin(user.id, body.deviceId, ipAddress, false, 'No agent profile');
                    throw new UnauthorizedException('Account not activated');
                }

                // Check if agent is activated
                if (!profile.isActivated) {
                    console.warn(`[Security] Agent ${user.email} is not activated`);
                    await this.authService.logAgentLogin(user.id, body.deviceId, ipAddress, false, 'Account not activated');
                    throw new UnauthorizedException('Account not activated or device not bound');
                }

                // First login - bind device
                if (!profile.deviceId) {
                    console.log(`✅ First login for ${user.email} - Binding device: ${body.deviceId}`);
                    await this.authService.bindAgentDevice(user.id, body.deviceId);
                }
                // Subsequent logins - verify device
                else if (profile.deviceId !== body.deviceId) {
                    console.error(`[Security] Device Mismatch for ${user.email}: Registered=${profile.deviceId}, Incoming=${body.deviceId}`);
                    await this.authService.logAgentLogin(user.id, body.deviceId, ipAddress, false, 'Device mismatch');
                    throw new UnauthorizedException('Device Access Denied. Please use your registered device.');
                }

                console.log(`✅ Device Verified: ${body.deviceId}`);
                // Log successful login
                await this.authService.logAgentLogin(user.id, body.deviceId, ipAddress, true, null);
            } catch (error) {
                // Re-throw auth errors after logging
                throw error;
            }
        }

        console.log('Debug Login Success:', user.email, 'Role:', user.role);
        return this.authService.login(user);
    }




    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('api-key')
    async generateApiKey(@Request() req) {
        const apiKey = await this.authService.generateApiKey(req.user.userId);
        return { apiKey };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('merchant-profile')
    async updateMerchantProfile(@Request() req, @Body() body: any) {
        // body should be validated CreateMerchantProfileDto or UpdateMerchantProfileDto
        // For flexibility in the wizard, we accept partial updates via upsert
        return this.authService.upsertMerchantProfile(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('merchant-profile')
    async getMerchantProfile(@Request() req) {
        return this.authService.getMerchantProfile(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('agents/invite')
    async inviteAgent(@Request() req, @Body() body: any) {
        // Generates an activation token link
        if (!body.email || !body.fullName || !body.phoneNumber || !body.branch) {
            throw new UnauthorizedException('Missing required fields');
        }
        return this.authService.inviteAgent(req.user.userId, body);
    }

    @Post('agent/activate')
    async activateAgent(@Body() body: any) {
        // Validates token, binds device, sets password
        if (!body.token || !body.otp || !body.password || !body.deviceId) {
            throw new UnauthorizedException('Missing activation details');
        }
        return this.authService.activateAgent(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('agent/stats')
    async getAgentStats(@Request() req) {
        if (req.user.role !== 'MERCHANT_AGENT') {
            throw new UnauthorizedException('Access denied');
        }
        return this.authService.getAgentDashboardStats(req.user.userId);
    }

    // Customer Onboarding - Phone Verification
    @UseGuards(AuthGuard('jwt'))
    @Post('onboarding/verify-phone')
    async verifyCustomerPhone(@Request() req, @Body() body: { phoneNumber: string }) {
        if (req.user.role !== 'MERCHANT_AGENT') throw new UnauthorizedException('Access denied');
        if (!body.phoneNumber) throw new UnauthorizedException('Phone number required');

        return this.authService.generateCustomerOtp(body.phoneNumber);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('onboarding/validate-otp')
    async validateCustomerOtp(@Request() req, @Body() body: { phoneNumber: string, otp: string }) {
        if (req.user.role !== 'MERCHANT_AGENT') throw new UnauthorizedException('Access denied');

        return this.authService.validateCustomerOtp(body.phoneNumber, body.otp);
    }



    // Full Onboarding Submission with Files
    @Post('agents/onboard')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'idCard', maxCount: 1 },
        { name: 'selfie', maxCount: 1 },
    ]))
    async onboardClient(
        @Request() req,
        @UploadedFiles() files: { idCard?: any[], selfie?: any[] },
        @Body() body: any
    ) {
        if (req.user.role !== 'MERCHANT_AGENT') throw new UnauthorizedException('Access denied');

        console.log('Onboarding Request Received:', body);
        console.log('Files:', files);

        // Validation - ensure files exist
        if (!files.idCard || !files.idCard[0]) throw new UnauthorizedException('ID Card photo is missing');
        if (!files.selfie || !files.selfie[0]) throw new UnauthorizedException('Selfie is missing');

        return this.authService.processOnboarding(req.user.userId, body, files);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('agents')
    async createAgent(@Request() req, @Body() body: any) {
        // Legacy direct creation (kept for backward compatibility or direct admin provisioning)
        console.log('AuthController: createAgent called');
        return this.authService.createAgent(req.user.userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('agents')
    async getAgents(@Request() req) {
        return this.authService.getAgents(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.ADMIN)
    @Post('admin/users')
    async createInternalUser(@Request() req, @Body() body: RegisterDto) {
        // Validate internal role
        const internalRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'COMPLIANCE_ADMIN', 'RISK_ADMIN', 'OPS_ADMIN', 'TECH_ADMIN', 'FINANCE_ADMIN'];
        if (!body.role || !internalRoles.includes(body.role)) {
            throw new UnauthorizedException('Invalid role for internal user');
        }

        await this.auditService.createLog({
            action: 'CREATE_INTERNAL_USER',
            userId: req.user.userId,
            details: { targetEmail: body.email, targetRole: body.role },
            ipAddress: req.ip
        });

        return this.authService.register(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin/users')
    async getInternalUsers(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.authService.getInternalUsers();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin/stats')
    async getDashboardStats(@Request() req) {
        const internalRoles = ['SUPER_ADMIN', 'ADMIN', 'OPS_ADMIN', 'RISK_ADMIN'];
        if (internalRoles.includes(req.user.role)) {
            return this.authService.getDashboardStats();
        }
        return this.authService.getMerchantStats(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('transactions')
    async getTransactions(@Request() req) {
        return this.authService.getTransactions(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('analytics')
    async getAnalytics(@Request() req) {
        return this.authService.getAnalytics(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('sudo')
    async sudoMode(@Request() req, @Body() body: { password: string }) {
        const token = await this.authService.generateSudoToken(req.user.sub, body.password);
        if (!token) throw new UnauthorizedException('Invalid password');

        await this.auditService.createLog({
            action: 'SUDO_MODE_ACCESS',
            userId: req.user.userId,
            ipAddress: req.ip
        });

        return { sudoToken: token };
    }

    @UseGuards(AuthGuard('jwt'), SudoGuard)
    @Post('admin/users/:id/suspend')
    async suspendUser(@Request() req, @Body() body: { isActive: boolean }, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') throw new UnauthorizedException('Access denied');

        await this.auditService.createLog({
            action: body.isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER',
            userId: req.user.userId,
            entityId: id,
            entityType: 'USER',
            details: { newValue: body.isActive },
            ipAddress: req.ip
        });

        return this.authService.suspendUser(id, body.isActive);
    }

    @UseGuards(AuthGuard('jwt'), SudoGuard)
    @Post('admin/users/:id/role')
    async updateUserRole(@Request() req, @Body() body: { role: string }, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') throw new UnauthorizedException('Access denied');

        const internalRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'COMPLIANCE_ADMIN', 'RISK_ADMIN', 'OPS_ADMIN', 'TECH_ADMIN'];
        if (!body.role || !internalRoles.includes(body.role)) {
            throw new UnauthorizedException('Invalid role');
        }

        await this.auditService.createLog({
            action: 'UPDATE_USER_ROLE',
            userId: req.user.userId,
            entityId: id,
            entityType: 'USER',
            details: { newRole: body.role },
            ipAddress: req.ip
        });

        return this.authService.updateUserRole(id, body.role);
    }

    @UseGuards(AuthGuard('jwt'), SudoGuard)
    @Post('admin/users/:id/reset-password')
    async resetPassword(@Request() req, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') throw new UnauthorizedException('Access denied');

        await this.auditService.createLog({
            action: 'RESET_PASSWORD',
            userId: req.user.userId,
            entityId: id,
            entityType: 'USER',
            ipAddress: req.ip
        });

        const tempPassword = await this.authService.resetPassword(id);
        return { tempPassword };
    }

    @UseGuards(AuthGuard('jwt'), SudoGuard)
    @Delete('admin/users/:id')
    async deleteUser(@Request() req, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') throw new UnauthorizedException('Access denied');

        await this.auditService.createLog({
            action: 'DELETE_USER',
            userId: req.user.userId,
            entityId: id,
            entityType: 'USER',
            ipAddress: req.ip
        });

        await this.authService.deleteUser(id);
        return { success: true, message: 'User deleted successfully' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin/analytics/financial')
    async getFinancialAnalytics(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') throw new UnauthorizedException('Access denied');
        return this.authService.getFinancialAnalytics();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('admin/analytics/risk')
    async getRiskAnalytics(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') throw new UnauthorizedException('Access denied');
        return this.authService.getRiskAnalytics();
    }

    // ==================== MOBILE ONBOARDING ENDPOINTS ====================

    @Post('send-otp')
    async sendOTP(@Body() body: { phoneNumber: string }) {
        const { phoneNumber } = body;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in cache/database (expires in 10 minutes)
        await this.authService.storeOTP(phoneNumber, otp);

        // TODO: Send SMS via SMS provider
        console.log(`OTP for ${phoneNumber}: ${otp}`);

        return {
            success: true,
            message: 'OTP sent successfully',
            // For development only - remove in production
            otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        };
    }

    @Post('verify-otp')
    async verifyOTP(@Body() body: { phoneNumber: string; otp: string }) {
        const { phoneNumber, otp } = body;

        // Verify OTP
        const isValid = await this.authService.verifyOTP(phoneNumber, otp);

        if (!isValid) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        // Create or get user
        let user = await this.authService.findByPhoneNumber(phoneNumber);

        if (!user) {
            // Create new customer user
            user = await this.authService.createCustomerUser(phoneNumber);
        }

        // Generate token
        const token = await this.authService.generateToken(user);

        return {
            success: true,
            userId: user.id,
            token,
        };
    }

    @Post('customer/verify-id')
    @UseGuards(AuthGuard('jwt'))
    async verifyCustomerID(@Body() body: { userId: string; type: 'NIN' | 'BVN'; value: string }) {
        const { userId, type, value } = body;

        // TODO: Integrate with Dojah API
        // For now, return mock data
        const mockVerification = {
            valid: true,
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            photoUrl: null,
        };

        // Store verification result
        await this.authService.storeIDVerification(userId, type, value, mockVerification);

        return {
            success: true,
            verification: mockVerification,
        };
    }

    @Post('customer/check-duplicate')
    @UseGuards(AuthGuard('jwt'))
    async checkDuplicateCustomer(@Body() body: { nin?: string; phoneNumber?: string }) {
        const { nin, phoneNumber } = body;

        const isDuplicate = await this.authService.checkDuplicateCustomer(nin, phoneNumber);

        return {
            isDuplicate,
            message: isDuplicate ? 'Customer already exists' : 'No duplicate found',
        };
    }

    @Post('customer/check-credit')
    @UseGuards(AuthGuard('jwt'))
    async checkCredit(@Body() body: { userId: string; nin: string }) {
        const { userId, nin } = body;

        // TODO: Integrate with Dojah Credit Scoring API
        // For now, return mock data
        const mockCreditScore = {
            score: 650 + Math.floor(Math.random() * 150), // Random score 650-800
            qualified: true,
            maxLoanAmount: 500000,
            rating: 'GOOD',
        };

        // Store credit score
        await this.authService.storeCreditScore(userId, mockCreditScore);

        return {
            success: true,
            ...mockCreditScore,
        };
    }

    @Post('onboarding/submit')
    @UseGuards(AuthGuard('jwt'))
    async submitOnboarding(@Body() body: any) {
        const { customer, ninVerification, creditScore, kyc, device, selectedProduct, loanPlan, consent, checklist } = body;

        // Create loan record
        const loan = await this.authService.createLoan({
            customerId: customer.userId,
            productId: selectedProduct.id,
            deviceIMEI: device.imei,
            loanAmount: loanPlan.totalRepayment - loanPlan.downPayment,
            downPayment: loanPlan.downPayment,
            monthlyRepayment: loanPlan.monthlyRepayment,
            tenure: loanPlan.tenure,
            status: 'ACTIVE',
        });

        return {
            success: true,
            loanId: loan.id,
            message: 'Onboarding completed successfully',
        };
    }
}


