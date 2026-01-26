import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreditService } from './credit.service';

@Controller('credit')
@UseGuards(AuthGuard('jwt'))
export class CreditController {
    constructor(private creditService: CreditService) { }

    @Post('verify-id')
    async verifyId(@Body() body: { type: 'BVN' | 'NIN'; value: string }) {
        return this.creditService.verifyIdentity(body.type, body.value);
    }

    @Post('check-eligibility')
    async checkEligibility(@Body() body: { bvn?: string; nin?: string; amount: number }) {
        return this.creditService.checkCreditEligibility(body);
    }
}
