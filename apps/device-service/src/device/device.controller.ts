import { Controller, Post, Get, Body, Param, Patch, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceStatus } from '@vistalock/database';
import { RegisterDeviceDto } from './dto/device.dto';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

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
    @UseGuards(RolesGuard)
    @Roles(Role.OPS_ADMIN, Role.SUPER_ADMIN)
    lockDevice(@Param('imei') imei: string) {
        return this.deviceService.updateLockStatus(imei, DeviceStatus.LOCKED);
    }

    @Patch(':imei/unlock')
    @UseGuards(RolesGuard)
    @Roles(Role.OPS_ADMIN, Role.SUPER_ADMIN)
    unlockDevice(@Param('imei') imei: string) {
        return this.deviceService.updateLockStatus(imei, DeviceStatus.UNLOCKED);
    }

    @Post(':imei/heartbeat')
    heartbeat(@Param('imei') imei: string) {
        return this.deviceService.recordHeartbeat(imei);
    }
}
