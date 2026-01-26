import { Module } from '@nestjs/common';

import { EnforcementService } from './enforcement.service';
import { EnforcementController } from './enforcement.controller';

@Module({
    imports: [],
    controllers: [EnforcementController],
    providers: [EnforcementService],
})
export class AppScheduleModule { }
