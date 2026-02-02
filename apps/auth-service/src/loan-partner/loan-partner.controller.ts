import { Controller, Post, Body, Get, Param, Headers, UseGuards, UnauthorizedException, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoanPartnerService } from './loan-partner.service';
import { CreateLoanPartnerDto, LpisCreateLoanDto, LpisWebhookDto } from './dto';
// TODO: Add proper AuthGuards (e.g. ApiKeyGuard)

@Controller('loan-partners')
export class LoanPartnerController {
    constructor(private readonly service: LoanPartnerService) { }

    // === ADMIN ENDPOINTS ===
    @Post()
    async createPartner(@Body() dto: CreateLoanPartnerDto) {
        return this.service.createPartner(dto);
    }

    @Get()
    async listPartners() {
        return this.service.findAll();
    }

    @Get('loans')
    @UseGuards(AuthGuard('jwt'))
    async getMyLoans(@Request() req) {
        // Enforce role check if needed, but getLoansForUser handles missing partner link
        if (req.user.role !== 'LOAN_PARTNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Access Denied');
        }
        return this.service.getLoansForUser(req.user.userId);
    }

    @Get('devices')
    @UseGuards(AuthGuard('jwt'))
    async getMyDevices(@Request() req) {
        if (req.user.role !== 'LOAN_PARTNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Access Denied');
        }
        return this.service.getDevicesForUser(req.user.userId);
    }
    @Get('credentials')
    @UseGuards(AuthGuard('jwt'))
    async getCredentials(@Request() req) {
        if (req.user.role !== 'LOAN_PARTNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Access Denied');
        }
        return this.service.getCredentials(req.user.userId);
    }

    @Post('credentials/rotate')
    @UseGuards(AuthGuard('jwt'))
    async rotateCredentials(@Request() req) {
        if (req.user.role !== 'LOAN_PARTNER' && req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Access Denied');
        }
        return this.service.rotateApiKey(req.user.userId);
    }

    // === LPIS ENDPOINTS (Protected by API Key usually) ===

    // Partner calls this to tell VistaLock "I funded a loan"
    @Post(':partnerId/loans')
    async createLoan(
        @Param('partnerId') partnerId: string,
        @Body() dto: LpisCreateLoanDto,
        @Headers('x-api-key') apiKey: string
    ) {
        // TODO: Validate apiKey against partner record
        return this.service.createLoanFromPartner(partnerId, dto);
    }

    // Partner calls this to tell VistaLock "Payment Received" or "Default"
    @Post(':partnerId/webhook')
    async handleWebhook(
        @Param('partnerId') partnerId: string,
        @Body() dto: LpisWebhookDto,
        @Headers('x-webhook-signature') signature: string
    ) {
        // TODO: Verify signature

        return this.service.handleWebhook(partnerId, dto);
    }
}
