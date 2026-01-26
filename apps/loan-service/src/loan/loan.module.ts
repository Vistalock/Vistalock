import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { NotificationService } from '../notifications/notification.service';
import { PaystackProvider } from '../payments/providers/paystack.provider';

@Module({
    imports: [ConfigModule],
    controllers: [LoanController],
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
