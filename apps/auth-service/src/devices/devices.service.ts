import { Injectable, ConflictException } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class DevicesService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient({
            datasources: { db: { url: process.env.DATABASE_URL } }
        });
    }

    async findAll(merchantId: string) {
        return this.prisma.device.findMany({
            where: { merchantId },
            include: {
                loans: {
                    where: { status: 'ACTIVE' },
                    take: 1
                }
            }
        });
    }

    async findOne(merchantId: string, imei: string) {
        return this.prisma.device.findFirst({
            where: { merchantId, imei },
            include: { loans: true }
        });
    }

    async create(merchantId: string, data: { imei: string; model: string }) {
        const existing = await this.prisma.device.findUnique({ where: { imei: data.imei } });
        if (existing) {
            throw new ConflictException('Device with this IMEI already exists');
        }

        return this.prisma.device.create({
            data: {
                imei: data.imei,
                model: data.model,
                merchantId: merchantId,
                status: 'PENDING_SETUP'
            }
        });
    }
}
