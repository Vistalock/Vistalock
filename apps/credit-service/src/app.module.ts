import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreditModule } from './credit/credit.module';
import { DojahModule } from './dojah/dojah.module';
import { ScoringModule } from './scoring/scoring.module';
import { FraudModule } from './fraud/fraud.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        CreditModule,
        DojahModule,
        ScoringModule,
        FraudModule,
    ],
})
export class AppModule { }
