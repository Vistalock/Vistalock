import { Controller, Get, Post, Body, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { LoanService } from './loan.service';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../auth/public.decorator';

@Controller('partner')
@UseGuards(RolesGuard)
export class LoanPartnerController {
    constructor(
        private readonly loanService: LoanService,
        private readonly configService: ConfigService,
    ) { }

    @Post('auth/login')
    @Public()
    login(@Body() body: { apiKey: string; apiSecret: string }) {
        if (!body.apiKey || !body.apiSecret) throw new ForbiddenException('Credentials required');
        return this.loanService.validatePartner(body.apiKey, body.apiSecret);
    }

    @Get('stats')
    @Roles(Role.LOAN_PARTNER)
    getStats(@Query('partnerId') partnerId: string) {
        // Validation: In a real app, we'd verify the user belongs to this partnerId from the JWT
        // For MVP, we assume the API Gateway or Auth Guard attaches the user context
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getPartnerStats(partnerId);
    }

    @Get('risk-config')
    @Roles(Role.LOAN_PARTNER)
    getRiskConfig(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getRiskConfig(partnerId);
    }

    @Post('risk-config')
    @Roles(Role.LOAN_PARTNER)
    updateRiskConfig(@Body() body: any) {
        const { partnerId, ...config } = body;
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.updateRiskConfig(partnerId, config);
    }

    @Get('wallet')
    @Roles(Role.LOAN_PARTNER)
    getWallet(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getPartnerWallet(partnerId);
    }

    @Get('merchants')
    @Roles(Role.LOAN_PARTNER)
    getMerchants(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getPartnerMerchants(partnerId);
    }
}
