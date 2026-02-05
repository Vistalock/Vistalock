import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { prisma, DeviceStatus, Prisma } from '@vistalock/database';

@Injectable()
export class DeviceService {

    async registerDevice(data: { imei: string; serialNumber?: string; model?: string; merchantId: string }) {
        console.log('Registering Device:', data);
        try {
            // Check Device Limit
            console.log('Checking limit for merchant:', data.merchantId);
            const merchant = await prisma.user.findUnique({
                where: { id: data.merchantId },
                include: { _count: { select: { devices: true } } }
            });

            console.log('Merchant found:', merchant ? 'yes' : 'no');
            if (!merchant) throw new NotFoundException('Merchant not found');

            const deviceCount = merchant._count.devices;
            const plan = merchant.subscriptionPlan || 'STARTER';
            console.log(`Plan: ${plan}, Count: ${deviceCount}`);

            const limits = {
                'STARTER': 20,
                'GROWTH': 200,
                'ENTERPRISE': Infinity
            };

            if (deviceCount >= limits[plan]) {
                throw new ForbiddenException(`Device limit reached for ${plan} plan (Max: ${limits[plan]})`);
            }

            console.log('Creating device...');
            return prisma.device.create({
                data: {
                    imei: data.imei,
                    serialNumber: data.serialNumber || `SN_${data.imei}`,
                    model: data.model,
                    merchantId: data.merchantId,
                    status: DeviceStatus.PENDING_SETUP,
                },
            });
        } catch (error) {
            console.error('Error in registerDevice:', error);
            throw error;
        }
    }

    async getDeviceStatus(imei: string) {
        const device = await prisma.device.findUnique({
            where: { imei },
        });
        if (!device) throw new NotFoundException('Device not found');
        return { status: device.status, lastHeartbeat: device.lastHeartbeat };
    }

    async updateLockStatus(imei: string, status: DeviceStatus) {
        return prisma.device.update({
            where: { imei },
            data: { status },
        });
    }

    async recordHeartbeat(imei: string) {
        return prisma.device.update({
            where: { imei },
            data: { lastHeartbeat: new Date() },
        });
    }

    async enrollDevice(data: { imei: string; userId: string; token: string }) {
        console.log(`Enrolling Device IMEI: ${data.imei} for User: ${data.userId}`);

        // 1. Verify Device Exists
        const device = await prisma.device.findUnique({ where: { imei: data.imei } });
        if (!device) throw new NotFoundException('Device not found');

        // 2. Verify Token (Mock)
        // In real world, verify signature of token signed by Agent Wizard

        // 3. Activate Device
        return prisma.device.update({
            where: { imei: data.imei },
            data: { status: DeviceStatus.UNLOCKED }
        });
    }

    async findAll(merchantId?: string) {
        const where: Prisma.DeviceWhereInput = {};
        if (merchantId) where.merchantId = merchantId;

        return prisma.device.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { loans: { where: { status: 'ACTIVE' } } }
        });
    }
}
