import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Request,
    UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { BillingService } from './billing.service';
import { PricingTierService } from './pricing-tier.service';
import {
    TopUpWalletDto,
    WalletTransactionQueryDto,
    EnrollmentBillingQueryDto,
    UsageStatsQueryDto
} from './dto';

@Controller('merchant/billing')
@UseGuards(AuthGuard('jwt'))
export class MerchantBillingController {
    constructor(
        private walletService: WalletService,
        private billingService: BillingService,
        private pricingTierService: PricingTierService
    ) { }

    // ==================== WALLET ====================

    /**
     * Get wallet balance
     */
    @Get('wallet')
    async getWallet(@Request() req) {
        this.ensureMerchant(req.user);
        return this.walletService.getBalance(req.user.userId);
    }

    /**
     * Initiate wallet top-up
     */
    @Post('wallet/topup')
    async topUpWallet(@Request() req, @Body() dto: TopUpWalletDto) {
        this.ensureMerchant(req.user);
        return this.walletService.initiateTopUp(req.user.userId, dto);
    }

    /**
     * Get wallet transaction history
     */
    @Get('wallet/transactions')
    async getTransactions(@Request() req, @Query() query: WalletTransactionQueryDto) {
        this.ensureMerchant(req.user);
        return this.walletService.getTransactions(req.user.userId, query);
    }

    // ==================== ENROLLMENT BILLING ====================

    /**
     * Get enrollment billing history
     */
    @Get('enrollments')
    async getEnrollmentHistory(@Request() req, @Query() query: EnrollmentBillingQueryDto) {
        this.ensureMerchant(req.user);
        return this.billingService.getEnrollmentHistory(req.user.userId, query);
    }

    /**
     * Get current pricing tiers
     */
    @Get('pricing')
    async getPricing() {
        return this.pricingTierService.findAll();
    }

    /**
     * Get monthly usage statistics
     */
    @Get('usage')
    async getUsageStats(@Request() req, @Query() query: UsageStatsQueryDto) {
        this.ensureMerchant(req.user);
        return this.billingService.getUsageStats(req.user.userId, query);
    }

    private ensureMerchant(user: any) {
        if (user.role !== 'MERCHANT') {
            throw new UnauthorizedException('Only merchants can access billing');
        }
    }
}
