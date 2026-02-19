import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { LoanPartnerController } from './loan-partner.controller';
import { NotificationService } from '../notifications/notification.service';
import { PaystackProvider } from '../payments/providers/paystack.provider';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_do_not_use_in_prod',
                signOptions: { expiresIn: '1d' },
            }),
            inject: [ConfigService],
        }),
    ],
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
