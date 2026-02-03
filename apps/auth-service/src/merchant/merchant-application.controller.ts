
import { Controller, Post, Get, Body, Param, UseGuards, Request, UnauthorizedException, UsePipes, ValidationPipe, Delete, Patch } from '@nestjs/common';
import { MerchantApplicationService } from './merchant-application.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateMerchantApplicationDto } from './dto/create-merchant-application.dto';

@Controller()
export class MerchantApplicationController {
    constructor(private appService: MerchantApplicationService) { }

    // PUBLIC: Check for duplicates before submission
    @Post('auth/merchant/check-duplicate')
    async checkDuplicate(@Body() body: { email: string; phone: string; businessName: string }) {
        return this.appService.checkDuplicates(body.email, body.phone, body.businessName);
    }

    // PUBLIC: Submit Application (Strictly Validated)
    @Post('auth/merchant/apply')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async submitApplication(
        @Body() body: CreateMerchantApplicationDto,
        @Request() req: any
    ) {
        const idempotencyKey = req.headers['x-idempotency-key'];
        return this.appService.submitApplication(body, idempotencyKey);
    }

    // PUBLIC: Activate Merchant Account
    @Post('auth/merchant/activate')
    async activateMerchant(@Body() body: { token: string; password: string }) {
        if (!body.token || !body.password) {
            throw new UnauthorizedException('Token and password are required');
        }
        return this.appService.activateMerchant(body.token, body.password);
    }

    // PROTECTED: List Applications (Admin Only)
    @UseGuards(AuthGuard('jwt'))
    @Get('admin/merchant-applications')
    async getApplications(@Request() req) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.getApplications();
    }

    // ADMIN: Ops Review
    @UseGuards(AuthGuard('jwt'))
    @Post('admin/merchant-applications/:id/review-ops')
    async reviewByOps(@Request() req, @Param('id') id: string, @Body() body: any) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.reviewByOps(id, req.user.userId, body);
    }

    // ADMIN: Automated Risk Assessment
    @UseGuards(AuthGuard('jwt'))
    @Post('admin/merchant-applications/:id/auto-assess-risk')
    async autoAssessRisk(@Request() req, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.autoAssessRisk(id, req.user.userId);
    }

    // ADMIN: Risk Review
    @UseGuards(AuthGuard('jwt'))
    @Post('admin/merchant-applications/:id/review-risk')
    async reviewByRisk(@Request() req, @Param('id') id: string, @Body() body: any) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.reviewByRisk(id, req.user.userId, body);
    }

    // ADMIN: Final Approval
    @UseGuards(AuthGuard('jwt'))
    @Post('admin/merchant-applications/:id/approve')
    async approveApplication(@Request() req, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.approveApplication(id, req.user.userId);
    }

    // PROTECTED: Reject Application
    @UseGuards(AuthGuard('jwt'))
    @Post('admin/merchant-applications/:id/reject')
    async rejectApplication(@Request() req, @Param('id') id: string, @Body() body: { reason: string }) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.rejectApplication(id, req.user.userId, body.reason);
    }

    // ADMIN: Delete Application
    @UseGuards(AuthGuard('jwt'))
    @Delete('admin/merchant-applications/:id')
    async deleteApplication(@Request() req, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.deleteApplication(id);
    }

    // ADMIN: Archive Application (Soft Delete)
    @UseGuards(AuthGuard('jwt'))
    @Patch('admin/merchant-applications/:id/archive')
    async archiveApplication(@Request() req, @Param('id') id: string) {
        if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'OPS_ADMIN' && req.user.role !== 'ADMIN') {
            throw new UnauthorizedException('Access denied');
        }
        return this.appService.softDeleteApplication(id);
    }
}
