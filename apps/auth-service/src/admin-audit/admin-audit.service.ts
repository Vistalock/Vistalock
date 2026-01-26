import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class AdminAuditService {
    private prisma = new PrismaClient();

    async createLog(data: { action: string; userId: string; entityId?: string; entityType?: string; details?: any; ipAddress?: string }) {
        return this.prisma.auditLog.create({
            data: {
                action: data.action,
                userId: data.userId,
                entityId: data.entityId,
                entityType: data.entityType,
                details: data.details,
                ipAddress: data.ipAddress
            }
        });
    }

    async findAll(userId?: string, action?: string, limit: number = 50) {
        const where: any = {};

        if (userId) where.userId = userId;
        if (action) where.action = { contains: action, mode: 'insensitive' };

        const logs = await this.prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: { email: true, role: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return logs.map(log => ({
            id: log.id,
            action: log.action,
            actor: log.user ? log.user.email : 'System',
            role: log.user ? log.user.role : 'SYSTEM',
            details: log.details,
            ip: log.ipAddress,
            timestamp: log.createdAt
        }));
    }
}
