import { Module } from '@nestjs/common';
import { FraudDetector } from './fraud.detector';

@Module({
    providers: [FraudDetector],
    exports: [FraudDetector],
})
export class FraudModule { }
