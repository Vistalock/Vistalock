
import { Module } from '@nestjs/common';
import { MerchantApplicationService } from './merchant-application.service';
import { MerchantApplicationController } from './merchant-application.controller';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [EmailModule],
    providers: [MerchantApplicationService],
    controllers: [MerchantApplicationController],
})
export class MerchantApplicationModule { }
