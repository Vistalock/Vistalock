import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreditService } from './credit.service';
import { EligibilityCheckDto, CreditDecisionDto } from './dto/credit.dto';

@Controller('credit')
export class CreditController {
    private readonly logger = new Logger(CreditController.name);

    constructor(private readonly creditService: CreditService) { }

    /**
     * Main eligibility check endpoint
     * POST /credit/eligibility-check
     */
    @Post('eligibility-check')
    @UseGuards(AuthGuard('jwt'))
    async checkEligibility(@Body() dto: EligibilityCheckDto): Promise<CreditDecisionDto> {
        this.logger.log(`Eligibility check request from merchant: ${dto.merchantId}, agent: ${dto.agentId}`);

        return this.creditService.checkEligibility(dto);
    }

    /**
     * Health check endpoint
     */
    @Post('health')
    async healthCheck() {
        return {
            status: 'ok',
            service: 'credit-service',
            timestamp: new Date().toISOString(),
        };
    }
}
