import { Controller, Post, Body, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoansService } from './loans.service';

@Controller('loans')
@UseGuards(AuthGuard('jwt'))
export class LoansController {
    constructor(private loansService: LoansService) { }

    @Post('calculate')
    async calculate(@Request() req, @Body() body: { productId: string; downPayment: number; tenureMonths: number }) {
        if (!body.productId || body.downPayment === undefined || !body.tenureMonths) {
            throw new BadRequestException('Missing required fields: productId, downPayment, tenureMonths');
        }

        const merchantId = req.user.tenantId; // Might be null for SuperAdmin, but mandatory for Agent
        return this.loansService.calculateLoan(body.productId, body.downPayment, body.tenureMonths, merchantId);
    }

    @Post()
    async create(@Request() req, @Body() body: any) {
        if (!body.customerId || !body.productId || !body.deviceId) {
            throw new BadRequestException('Missing customerId, productId, or deviceId');
        }

        const merchantId = req.user.tenantId;
        if (!merchantId) throw new BadRequestException('Merchant Context Required');

        return this.loansService.createLoan(merchantId, body);
    }
}
