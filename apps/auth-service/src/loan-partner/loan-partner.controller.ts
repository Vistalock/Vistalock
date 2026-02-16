import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    UseGuards,
    Request,
    UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoanPartnerService } from './loan-partner.service';
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

// ==================== MERCHANT LOAN PARTNER MANAGEMENT ====================

@Controller('merchant/loan-partners')
@UseGuards(AuthGuard('jwt'))
export class MerchantLoanPartnerController {
    constructor(private readonly service: LoanPartnerService) { }

    /**
     * List all loan partners for the authenticated merchant
     */
    @Get()
    async listMyLoanPartners(@Request() req) {
        this.ensureMerchant(req.user);
        return this.service.findAllForMerchant(req.user.userId);
    }

    /**
     * Get a specific loan partner
     */
    @Get(':id')
    async getLoanPartner(@Request() req, @Param('id') id: string) {
        this.ensureMerchant(req.user);
        return this.service.findOneForMerchant(req.user.userId, id);
    }

    /**
     * Create a new loan partner
     */
    @Post()
    async createLoanPartner(@Request() req, @Body() dto: CreateLoanPartnerDto) {
        this.ensureMerchant(req.user);
        return this.service.createPartnerForMerchant(req.user.userId, dto);
    }

    /**
     * Update a loan partner
     */
    @Patch(':id')
    async updateLoanPartner(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdateLoanPartnerDto
    ) {
        this.ensureMerchant(req.user);
        return this.service.updatePartnerForMerchant(req.user.userId, id, dto);
    }

    /**
     * Delete a loan partner
     */
    @Delete(':id')
    async deleteLoanPartner(@Request() req, @Param('id') id: string) {
        this.ensureMerchant(req.user);
        return this.service.deletePartnerForMerchant(req.user.userId, id);
    }

    /**
     * Rotate API credentials for a loan partner
     */
    @Post(':id/rotate-credentials')
    async rotateCredentials(@Request() req, @Param('id') id: string) {
        this.ensureMerchant(req.user);
        return this.service.rotateApiCredentials(req.user.userId, id);
    }

    /**
     * Test webhook connection
     */
    @Post(':id/test-webhook')
    async testWebhook(@Request() req, @Param('id') id: string) {
        this.ensureMerchant(req.user);
        return this.service.testWebhook(req.user.userId, id);
    }

    private ensureMerchant(user: any) {
        if (user.role !== 'MERCHANT') {
            throw new UnauthorizedException('Only merchants can manage loan partners');
        }
    }
}

// ==================== EXTERNAL LOAN PARTNER API ====================

@Controller('loan-partner-api')
export class LoanPartnerApiController {
    constructor(private readonly service: LoanPartnerService) { }

    /**
     * Loan partner authentication
     */
    @Post('auth/login')
    async login(@Body() dto: LoanPartnerLoginDto) {
        return this.service.authenticateLoanPartner(dto);
    }

    /**
     * Get dashboard stats
     */
    @Get('stats')
    @UseGuards(AuthGuard('jwt')) // TODO: Switch to 'loan-partner' strategy once implemented
    async getStats(@Request() req) {
        // For now using standard JWT guard as we haven't implemented specific strategy yet
        // In real impl, we'd extract partnerId from the specific token
        const partnerId = req.user.sub;
        return this.service.getPartnerStats(partnerId);
    }



    /**
     * Create a loan (from loan partner)
     * Requires loan partner authentication
     */
    @Post('loans')
    @UseGuards(AuthGuard('loan-partner')) // TODO: Implement loan partner auth guard
    async createLoan(@Request() req, @Body() dto: CreateLoanFromPartnerDto) {
        const partnerId = req.user.partnerId; // From JWT
        return this.service.createLoanFromPartner(partnerId, dto);
    }

    /**
     * Update payment status
     */
    @Post('repayments')
    @UseGuards(AuthGuard('loan-partner'))
    async updatePayment(@Request() req, @Body() dto: PaymentUpdateDto) {
        const partnerId = req.user.partnerId;
        return this.service.updatePayment(partnerId, dto);
    }

    /**
     * Notify about overdue payment
     */
    @Post('overdue')
    @UseGuards(AuthGuard('loan-partner'))
    async notifyOverdue(@Request() req, @Body() dto: OverdueNotificationDto) {
        const partnerId = req.user.partnerId;
        return this.service.handleOverdueNotification(partnerId, dto);
    }

    /**
     * Close a loan
     */
    @Post('loan-closed')
    @UseGuards(AuthGuard('loan-partner'))
    async closeLoan(@Request() req, @Body() dto: LoanClosureDto) {
        const partnerId = req.user.partnerId;
        return this.service.closeLoan(partnerId, dto);
    }

    /**
     * Raise a dispute
     */
    @Post('dispute')
    @UseGuards(AuthGuard('loan-partner'))
    async raiseDispute(@Request() req, @Body() dto: DisputeDto) {
        // TODO: Implement dispute handling
        return {
            success: true,
            message: 'Dispute raised successfully'
        };
    }

    /**
     * Get devices (merchant-scoped)
     */
    @Get('devices')
    @UseGuards(AuthGuard('loan-partner'))
    async getDevices(@Request() req) {
        const partnerId = req.user.partnerId;
        return this.service.getDevicesForPartner(partnerId);
    }

    /**
     * Get loans (merchant-scoped)
     */
    @Get('loans')
    @UseGuards(AuthGuard('loan-partner'))
    async getLoans(@Request() req) {
        const partnerId = req.user.partnerId;
        return this.service.getLoansForPartner(partnerId);
    }

    /**
     * Get products (merchant-scoped)
     */
    @Get('products')
    @UseGuards(AuthGuard('loan-partner'))
    async getProducts(@Request() req) {
        const partnerId = req.user.partnerId;
        return this.service.getProductsForPartner(partnerId);
    }
}
