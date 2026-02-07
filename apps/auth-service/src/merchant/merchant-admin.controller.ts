import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MerchantApplicationService } from './merchant-application.service';

@Controller('admin')
export class MerchantAdminController {
    constructor(private readonly appService: MerchantApplicationService) { }

    // ADMIN: Manually activate merchant (bypass activation link)
    @UseGuards(AuthGuard('jwt'))
    @Post('merchant-applications/:id/force-activate')
    async forceActivateMerchant(
        @Request() req,
        @Body() body: { applicationId: string; password: string }
    ) {
        // Only Super Admin or Compliance Admin can force activate
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'COMPLIANCE_ADMIN') {
            throw new UnauthorizedException('Access denied');
        }

        try {
            return await this.appService.forceActivateMerchant(body.applicationId, body.password);
        } catch (error) {
            throw new UnauthorizedException(error.message || 'Force activation failed');
        }
    }

    // ADMIN: Reset merchant activation (delete existing merchant and allow re-activation)
    @UseGuards(AuthGuard('jwt'))
    @Post('merchant-applications/:id/reset-activation')
    async resetActivation(
        @Request() req,
        @Body() body: { applicationId: string }
    ) {
        // Only Super Admin can reset activation
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Only Super Admin can reset activation');
        }

        try {
            return await this.appService.resetMerchantActivation(body.applicationId);
        } catch (error) {
            throw new UnauthorizedException(error.message || 'Reset failed');
        }
    }
}
