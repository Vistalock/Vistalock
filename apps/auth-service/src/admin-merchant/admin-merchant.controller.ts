import { Controller, Get, Patch, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AdminMerchantService } from './admin-merchant.service';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';

@Controller('admin/merchants')
export class AdminMerchantController {
    constructor(private merchantService: AdminMerchantService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async listMerchants(@Query('status') status?: string, @Query('search') search?: string) {
        return this.merchantService.findAll(status, search);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' }
    ) {
        return this.merchantService.updateStatus(id, body.status);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/limits')
    async updateLimits(
        @Param('id') id: string,
        @Body() body: { maxDevices: number }
    ) {
        return this.merchantService.updateLimits(id, body.maxDevices);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('create-from-application/:applicationId')
    async createFromApplication(
        @Param('applicationId') applicationId: string,
        @Body() body: { password: string, maxDevices: number, maxAgents: number }
    ) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(body.password, salt);

        return this.merchantService.createFromApplication(applicationId, {
            passwordHash,
            maxDevices: body.maxDevices || 10,
            maxAgents: body.maxAgents || 5
        });
    }
}
