import { Controller, Post, Body, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('confirm-down-payment')
    async confirmDownPayment(@Request() req, @Body() body: { loanId: string; amount: number; reference?: string }) {
        if (!body.loanId || !body.amount) {
            throw new BadRequestException('loanId and amount are required');
        }
        // tenantId is the merchantId for agents
        const merchantId = req.user.tenantId;
        if (!merchantId) throw new BadRequestException('User is not associated with a merchant');

        return this.paymentsService.confirmDownPayment(merchantId, body.loanId, body.amount, body.reference);
    }
}
