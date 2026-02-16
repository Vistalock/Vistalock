import { Module } from '@nestjs/common';
import { MerchantLoanPartnerController, LoanPartnerApiController } from './loan-partner.controller';
import { LoanPartnerService } from './loan-partner.service';
import { PrismaService } from '../prisma.service';
import { DeviceControlModule } from '../device-control/device-control.module';
import { AuthModule } from '../auth/auth.module';
import { LoanPartnerStrategy } from './loan-partner.strategy';

@Module({
    imports: [DeviceControlModule, AuthModule],
    controllers: [MerchantLoanPartnerController, LoanPartnerApiController],
    providers: [LoanPartnerService, PrismaService, LoanPartnerStrategy],
    exports: [LoanPartnerService]
})
export class LoanPartnerModule { }
