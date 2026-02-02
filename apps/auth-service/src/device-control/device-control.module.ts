import { Module } from '@nestjs/common';
import { DeviceControlService } from './device-control.service';
import { DeviceControlController } from './device-control.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [DeviceControlController],
    providers: [DeviceControlService, PrismaService],
    exports: [DeviceControlService],
})
export class DeviceControlModule { }
