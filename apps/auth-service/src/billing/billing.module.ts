import { Module } from '@nestjs/common';
import { MerchantBillingController } from './merchant-billing.controller';
import { AdminBillingController } from './admin-billing.controller';
import { WalletService } from './wallet.service';
import { BillingService } from './billing.service';
import { PricingTierService } from './pricing-tier.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [MerchantBillingController, AdminBillingController],
    providers: [WalletService, BillingService, PricingTierService, PrismaService],
    exports: [WalletService, BillingService, PricingTierService]
})
export class BillingModule { }
