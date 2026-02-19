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

    @Get('applications')
    @Roles(Role.LOAN_PARTNER)
    getApplications(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getPartnerApplications(partnerId);
    }

    @Post('applications/decision')
    @Roles(Role.LOAN_PARTNER)
    processDecision(@Body() body: { partnerId: string; loanId: string; decision: 'APPROVE' | 'REJECT' }) {
        if (!body.partnerId || !body.loanId || !body.decision) throw new ForbiddenException('Missing required fields');
        return this.loanService.processLoanDecision(body.partnerId, body.loanId, body.decision);
    }

    @Get('commissions')
    @Roles(Role.LOAN_PARTNER)
    getCommissions(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getPartnerCommissions(partnerId);
    }

    @Get('disputes')
    @Roles(Role.LOAN_PARTNER)
    getDisputes(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getPartnerDisputes(partnerId);
    }

    @Post('disputes/resolve')
    @Roles(Role.LOAN_PARTNER)
    resolveDispute(@Body() body: { partnerId: string; disputeId: string; resolution: string; status: 'RESOLVED' | 'REJECTED' }) {
        if (!body.partnerId || !body.disputeId || !body.status) throw new ForbiddenException('Missing required fields');
        return this.loanService.resolveDispute(body.partnerId, body.disputeId, body.resolution, body.status);
    }

    @Get('integrations')
    @Roles(Role.LOAN_PARTNER)
    getIntegrations(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getIntegrationDetails(partnerId);
    }

    @Post('rotate-key')
    @Roles(Role.LOAN_PARTNER)
    rotateKey(@Body() body: { partnerId: string }) {
        if (!body.partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.rotateApiKey(body.partnerId);
    }

    @Post('webhook')
    @Roles(Role.LOAN_PARTNER)
    updateWebhook(@Body() body: { partnerId: string; webhookUrl: string; webhookSecret?: string }) {
        if (!body.partnerId || !body.webhookUrl) throw new ForbiddenException('Missing required fields');
        return this.loanService.updateWebhook(body.partnerId, body.webhookUrl, body.webhookSecret);
    }

    @Get('team')
    @Roles(Role.LOAN_PARTNER)
    getTeam(@Query('partnerId') partnerId: string) {
        if (!partnerId) throw new ForbiddenException('Partner ID is required');
        return this.loanService.getPartnerTeam(partnerId);
    }

    @Post('invite')
    @Roles(Role.LOAN_PARTNER)
    inviteMember(@Body() body: { partnerId: string; email: string; role: string }) {
        if (!body.partnerId || !body.email || !body.role) throw new ForbiddenException('Missing required fields');
        return this.loanService.inviteTeamMember(body.partnerId, body.email, body.role);
    }
}
