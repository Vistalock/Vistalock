import { Module } from '@nestjs/common';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { DojahModule } from '../dojah/dojah.module';
import { ScoringModule } from '../scoring/scoring.module';
import { FraudModule } from '../fraud/fraud.module';

@Module({
    imports: [DojahModule, ScoringModule, FraudModule],
    controllers: [CreditController],
    providers: [CreditService],
    exports: [CreditService],
})
export class CreditModule { }
