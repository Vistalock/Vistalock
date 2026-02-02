
import { Module } from '@nestjs/common';
import { MerchantApplicationService } from './merchant-application.service';
import { MerchantApplicationController } from './merchant-application.controller';
import { EmailModule } from '../email/email.module';
import { CreditServiceAdapter } from '../integration/credit-service.adapter';

@Module({
    imports: [EmailModule],
    providers: [MerchantApplicationService, CreditServiceAdapter],
    controllers: [MerchantApplicationController],
})
export class MerchantApplicationModule { }
