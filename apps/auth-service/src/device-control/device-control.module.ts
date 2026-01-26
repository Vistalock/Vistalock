import { Module } from '@nestjs/common';
import { DeviceControlService } from './device-control.service';
import { DeviceControlController } from './device-control.controller';

@Module({
    controllers: [DeviceControlController],
    providers: [DeviceControlService],
    exports: [DeviceControlService],
})
export class DeviceControlModule { }
