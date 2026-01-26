import { Module } from '@nestjs/common';
import { AdminConfigController } from './admin-config.controller';
import { AdminConfigService } from './admin-config.service';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [AdminConfigController],
    providers: [AdminConfigService],
})
export class AdminConfigModule { }
