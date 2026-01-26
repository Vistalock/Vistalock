import { Controller, Get, Post, Body, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { DeviceControlService } from './device-control.service';

// Note: Real DPC devices authenticate via specialized Certs or API Keys, not User JWT.
// For now, checks are open (mock) or could use a basic API Key header.
@Controller('device-control')
export class DeviceControlController {
    constructor(private readonly deviceControlService: DeviceControlService) { }

    @Get('policy/:imei')
    async getPolicy(@Param('imei') imei: string) {
        return this.deviceControlService.getPolicy(imei);
    }

    @Post('heartbeat')
    async heartbeat(@Body() body: any) {
        return this.deviceControlService.heartbeat(body);
    }
}
