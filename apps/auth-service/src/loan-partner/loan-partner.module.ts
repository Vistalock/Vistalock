import { Module } from '@nestjs/common';
import { MerchantLoanPartnerController, LoanPartnerApiController } from './loan-partner.controller';
import { LoanPartnerService } from './loan-partner.service';
import { PrismaService } from '../prisma.service';
import { DeviceControlModule } from '../device-control/device-control.module';

@Module({
    imports: [DeviceControlModule],
    controllers: [MerchantLoanPartnerController, LoanPartnerApiController],
    providers: [LoanPartnerService, PrismaService],
    exports: [LoanPartnerService]
})
export class LoanPartnerModule { }
