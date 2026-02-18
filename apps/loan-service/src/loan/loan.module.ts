import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { LoanPartnerController } from './loan-partner.controller';
import { NotificationService } from '../notifications/notification.service';
import { PaystackProvider } from '../payments/providers/paystack.provider';

@Module({
    imports: [ConfigModule],
    controllers: [LoanController, LoanPartnerController],
    providers: [
        LoanService,
        NotificationService,
        {
            provide: 'PaymentProvider',
            useClass: PaystackProvider,
        }
    ],
})
export class LoanModule { }
