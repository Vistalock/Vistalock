import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UnauthorizedException,
    Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BillingService } from './billing.service';
import { WalletService } from './wallet.service';
import { PricingTierService } from './pricing-tier.service';
import {
    BillingOverviewQueryDto,
    MerchantBillingQueryDto,
    ProcessRefundDto,
    AdjustWalletDto,
    CreatePricingTierDto,
    UpdatePricingTierDto
} from './dto';

@Controller('admin/billing')
@UseGuards(AuthGuard('jwt'))
export class AdminBillingController {
    constructor(
        private billingService: BillingService,
        private walletService: WalletService,
        private pricingTierService: PricingTierService
    ) { }

    // ==================== BILLING OVERVIEW ====================

    /**
     * Get billing overview
     */
    @Get('overview')
    async getOverview(@Request() req, @Query() query: BillingOverviewQueryDto) {
        this.ensureAdmin(req.user);

        // TODO: Implement comprehensive billing overview
        // - Total revenue
        // - Revenue by tier
        // - Top merchants by revenue
        // - Pending payments
        // - Refunds

        return {
            message: 'Billing overview - to be implemented',
            query
        };
    }

    /**
     * Get merchant billing details
     */
    @Get('merchants')
    async getMerchantBilling(@Request() req, @Query() query: MerchantBillingQueryDto) {
        this.ensureAdmin(req.user);

        // TODO: Implement merchant billing list
        // - List all merchants with billing info
        // - Wallet balances
        // - Monthly spend
        // - Search/filter

        return {
            message: 'Merchant billing list - to be implemented',
            query
        };
    }

    // ==================== REFUNDS ====================

    /**
     * Process refund
     */
    @Post('refund')
    async processRefund(@Request() req, @Body() dto: ProcessRefundDto) {
        this.ensureAdmin(req.user);
        return this.billingService.processRefund(dto.billingId, dto.reason);
    }

    // ==================== WALLET MANAGEMENT ====================

    /**
     * Adjust merchant wallet (admin)
     */
    @Post('wallet/:merchantId/adjust')
    async adjustWallet(
        @Request() req,
        @Param('merchantId') merchantId: string,
        @Body() dto: AdjustWalletDto
    ) {
        this.ensureAdmin(req.user);

        if (dto.amount > 0) {
            // Credit wallet
            await this.walletService.processPayment(
                dto.reference || `ADMIN-CREDIT-${Date.now()}`,
                dto.amount,
                merchantId
            );
        } else {
            // Debit wallet
            await this.walletService.deduct(
                merchantId,
                Math.abs(dto.amount),
                dto.reason,
                dto.reference
            );
        }

        return {
            success: true,
            message: `Wallet adjusted by ₦${dto.amount}`
        };
    }

    // ==================== PRICING TIER MANAGEMENT ====================

    /**
     * Get all pricing tiers
     */
    @Get('pricing-tiers')
    async getAllPricingTiers(@Request() req) {
        this.ensureAdmin(req.user);
        return this.pricingTierService.findAllAdmin();
    }

    /**
     * Get pricing tier usage statistics
     */
    @Get('pricing-tiers/stats')
    async getTierStats(@Request() req) {
        this.ensureAdmin(req.user);
        return this.pricingTierService.getTierUsageStats();
    }

    /**
     * Create pricing tier
     */
    @Post('pricing-tiers')
    async createPricingTier(@Request() req, @Body() dto: CreatePricingTierDto) {
        this.ensureAdmin(req.user);
        return this.pricingTierService.create(dto);
    }

    /**
     * Update pricing tier
     */
    @Patch('pricing-tiers/:id')
    async updatePricingTier(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdatePricingTierDto
    ) {
        this.ensureAdmin(req.user);
        return this.pricingTierService.update(id, dto);
    }

    /**
     * Delete pricing tier
     */
    @Delete('pricing-tiers/:id')
    async deletePricingTier(@Request() req, @Param('id') id: string) {
        this.ensureAdmin(req.user);
        return this.pricingTierService.delete(id);
    }

    private ensureAdmin(user: any) {
        if (user.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Admin access required');
        }
    }
}
