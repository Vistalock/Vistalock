import { Controller, Get, Put, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AdminConfigService } from './admin-config.service';
import { AuthGuard } from '@nestjs/passport';
import { SudoGuard } from '../auth/sudo.guard';

@Controller('admin/config')
export class AdminConfigController {
    constructor(private configService: AdminConfigService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getConfig() {
        return this.configService.getConfig();
    }

    @UseGuards(AuthGuard('jwt'), SudoGuard)
    @Put()
    async updateConfig(@Body() body: any) {
        return this.configService.updateConfig(body);
    }
}
