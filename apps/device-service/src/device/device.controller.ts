import { Controller, Post, Get, Body, Param, Patch, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceStatus } from '@vistalock/database';
import { RegisterDeviceDto } from './dto/device.dto';

@Controller('devices')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) { }

    @Post()
    register(@Body() body: RegisterDeviceDto) {
        return this.deviceService.registerDevice(body);
    }

    @Post('enroll')
    enroll(@Body() body: { imei: string; userId: string; token: string }) {
        return this.deviceService.enrollDevice(body);
    }

    @Get()
    findAll(@Query('merchantId') merchantId?: string) {
        return this.deviceService.findAll(merchantId);
    }

    @Get(':imei/status')
    getStatus(@Param('imei') imei: string) {
        return this.deviceService.getDeviceStatus(imei);
    }

    @Patch(':imei/lock')
    lockDevice(@Param('imei') imei: string) {
        return this.deviceService.updateLockStatus(imei, DeviceStatus.LOCKED);
    }

    @Patch(':imei/unlock')
    unlockDevice(@Param('imei') imei: string) {
        return this.deviceService.updateLockStatus(imei, DeviceStatus.UNLOCKED);
    }

    @Post(':imei/heartbeat')
    heartbeat(@Param('imei') imei: string) {
        return this.deviceService.recordHeartbeat(imei);
    }
}
