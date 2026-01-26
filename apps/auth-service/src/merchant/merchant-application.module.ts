
import { Module } from '@nestjs/common';
import { MerchantApplicationService } from './merchant-application.service';
import { MerchantApplicationController } from './merchant-application.controller';

@Module({
    providers: [MerchantApplicationService],
    controllers: [MerchantApplicationController],
})
export class MerchantApplicationModule { }
