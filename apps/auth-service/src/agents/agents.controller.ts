import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgentsService } from './agents.service';

@Controller('agents')
export class AgentsController {
    constructor(private agentsService: AgentsService) { }

    /**
     * Create new agent (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Post()
    async createAgent(@Request() req: any, @Body() body: {
        fullName: string;
        phoneNumber: string;
        email?: string;
        branch: string;
        onboardingLimit?: number;
    }) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can create agents');
        }

        return this.agentsService.createAgent(merchantId, body);
    }

    /**
     * List all agents (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async listAgents(@Request() req: any) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can view agents');
        }

        return this.agentsService.findAll(merchantId);
    }

    /**
     * Get single agent (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getAgent(@Request() req: any, @Param('id') agentId: string) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can view agents');
        }

        return this.agentsService.findOne(agentId, merchantId);
    }

    /**
     * Update agent (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async updateAgent(
        @Request() req: any,
        @Param('id') agentId: string,
        @Body() body: {
            fullName?: string;
            branch?: string;
            onboardingLimit?: number;
        }
    ) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can update agents');
        }

        return this.agentsService.updateAgent(agentId, merchantId, body);
    }

    /**
     * Deactivate agent (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deactivateAgent(@Request() req: any, @Param('id') agentId: string) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can deactivate agents');
        }

        return this.agentsService.deactivateAgent(agentId, merchantId);
    }

    /**
     * Permanently delete agent (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/permanent')
    async permanentlyDeleteAgent(@Request() req: any, @Param('id') agentId: string) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can delete agents');
        }

        return this.agentsService.permanentlyDeleteAgent(agentId, merchantId);
    }

    /**
     * Resend activation link (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/resend-activation')
    async resendActivation(@Request() req: any, @Param('id') agentId: string) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can resend activation');
        }

        return this.agentsService.resendActivation(agentId, merchantId);
    }

    /**
     * Validate activation token (Public)
     */
    @Post('validate-token')
    async validateToken(@Body() body: { token: string }) {
        if (!body.token) {
            throw new BadRequestException('Token is required');
        }

        return this.agentsService.validateActivationToken(body.token);
    }

    /**
     * Activate agent account (Public)
     */
    @Post('activate')
    async activateAgent(@Body() body: {
        token: string;
        password: string;
        deviceId?: string;  // Optional - not used during web activation
    }) {
        if (!body.token || !body.password) {
            throw new BadRequestException('Token and password are required');
        }

        // Validate password strength (12+ characters)
        if (body.password.length < 12) {
            throw new BadRequestException('Password must be at least 12 characters long');
        }

        return this.agentsService.activateAgent(body);
    }

    /**
     * Unbind device from agent (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/unbind-device')
    async unbindDevice(@Request() req: any, @Param('id') agentId: string) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can unbind devices');
        }

        return this.agentsService.unbindDevice(agentId, merchantId);
    }

    /**
     * Get agent login logs (Merchant only)
     */
    @UseGuards(AuthGuard('jwt'))
    @Get(':id/login-logs')
    async getLoginLogs(@Request() req: any, @Param('id') agentId: string) {
        const merchantId = req.user.tenantId;

        if (!merchantId || req.user.role !== 'MERCHANT') {
            throw new BadRequestException('Only merchants can view login logs');
        }

        const logs = this.agentsService.getLoginLogs(agentId, merchantId);
        return logs;
    }

    // ==========================================
    // Phase 4: Mobile App Specific Endpoints
    // ==========================================

    /**
     * Unified New Sale API for Agent App
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('sales/new')
    async createSale(@Request() req: any, @Body() body: any) {
        const merchantId = req.user.tenantId || req.user.merchantId;
        if (!merchantId || req.user.role !== 'MERCHANT_AGENT') {
            throw new BadRequestException('Only agents can create sales directly through this flow');
        }
        return this.agentsService.createAgentSale(req.user.userId, merchantId, body);
    }

    /**
     * Dashboard Stats for Agent App
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('dashboard')
    async getDashboard(@Request() req: any) {
        const merchantId = req.user.tenantId || req.user.merchantId;
        return this.agentsService.getDashboardStats(req.user.userId, merchantId);
    }

    /**
     * Customers for Agent App
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('customers')
    async getCustomers(@Request() req: any) {
        const merchantId = req.user.tenantId || req.user.merchantId;
        return this.agentsService.getAgentCustomers(req.user.userId, merchantId);
    }

    /**
     * Monitored Devices for Agent App
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('device-monitors')
    async getDeviceMonitors(@Request() req: any) {
        const merchantId = req.user.tenantId || req.user.merchantId;
        return this.agentsService.getAgentDevices(req.user.userId, merchantId);
    }

    /**
     * Notifications for Agent App
     */
    @UseGuards(AuthGuard('jwt'))
    @Get('notifications')
    async getNotifications(@Request() req: any) {
        const merchantId = req.user.tenantId || req.user.merchantId;
        return this.agentsService.getAgentNotifications(req.user.userId, merchantId);
    }
}
