import { Controller, Get, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';

@Controller('devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
    constructor(private devicesService: DevicesService) { }

    @Get()
    async findAll(@Request() req: any) {
        const merchantId = req.user.tenantId;
        if (!merchantId) throw new BadRequestException('Merchant Context Required');
        return this.devicesService.findAll(merchantId);
    }

    @Post()
    async create(@Request() req: any, @Body() body: { imei: string; model: string }) {
        const merchantId = req.user.tenantId;
        if (!merchantId) throw new BadRequestException('Merchant Context Required');
        if (!body.imei || !body.model) throw new BadRequestException('IMEI and Model required');

        return this.devicesService.create(merchantId, body);
    }
}
