import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('admin/audit')
export class AdminAuditController {
    constructor(private auditService: AdminAuditService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getLogs(
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('limit') limit?: string
    ) {
        return this.auditService.findAll(userId, action, limit ? parseInt(limit) : 50);
    }
}
