import { Module } from '@nestjs/common';
import { MerchantFeaturesController } from './merchant-features.controller';
import { AdminFeaturesController } from './admin-features.controller';
import { FeaturesService } from './features.service';
import { PrismaService } from '../prisma.service';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [BillingModule],
    controllers: [MerchantFeaturesController, AdminFeaturesController],
    providers: [FeaturesService, PrismaService],
    exports: [FeaturesService]
})
export class FeaturesModule { }
