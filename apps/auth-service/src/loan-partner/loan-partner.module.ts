import { Module } from '@nestjs/common';
import { LoanPartnerController } from './loan-partner.controller';
import { LoanPartnerService } from './loan-partner.service';
import { PrismaService } from '../prisma.service';
import { DeviceControlModule } from '../device-control/device-control.module';

@Module({
    imports: [DeviceControlModule],
    controllers: [LoanPartnerController],
    providers: [LoanPartnerService, PrismaService],
    exports: [LoanPartnerService],
})
export class LoanPartnerModule { }
