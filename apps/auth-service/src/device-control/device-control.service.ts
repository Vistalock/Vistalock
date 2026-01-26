import { Injectable, NotFoundException } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class DeviceControlService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient({
            datasources: { db: { url: process.env.DATABASE_URL } }
        });
    }

    async getPolicy(imei: string) {
        const device = await this.prisma.device.findUnique({
            where: { imei },
            include: {
                loans: {
                    where: { status: { in: ['ACTIVE', 'DEFAULTED'] } },
                    include: { payments: { where: { status: { in: ['PENDING', 'LATE'] } } } }
                }
            }
        });

        if (!device) throw new NotFoundException('Device not found');

        // Defaults
        let lock = false;
        let lockMessage = "";
        let lockStage = 0;
        let allowedApps: string[] = [];

        // Manual Lock Override
        if (device.status === 'LOCKED') {
            lock = true;
            lockStage = 3;
            lockMessage = "Device Locked by Admin. Contact Support.";
        } else {
            // Logic Check from Loans
            const activeLoan = device.loans[0];
            if (activeLoan) {
                // Check overdue payments
                const now = new Date();
                let maxOverdueDays = 0;

                // @ts-ignore
                if (activeLoan.payments) {
                    // @ts-ignore
                    for (const pay of activeLoan.payments) {
                        if (new Date(pay.dueDate) < now && pay.status === 'PENDING') {
                            const diffTime = Math.abs(now.getTime() - new Date(pay.dueDate).getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays > maxOverdueDays) maxOverdueDays = diffDays;
                        }
                    }
                }

                if (maxOverdueDays > 7) {
                    // STAGE 3: Full Lock
                    lock = true;
                    lockStage = 3;
                    lockMessage = `Payment Overdue by ${maxOverdueDays} days. Full Lock Active.`;
                } else if (maxOverdueDays > 3) {
                    // STAGE 2: Partial Lock
                    lock = true;
                    lockStage = 2;
                    lockMessage = `Payment Overdue. Pay now to avoid full lock.`;
                    allowedApps = ['com.vistalock.pay', 'com.vistalock.support'];
                } else if (maxOverdueDays > 0) {
                    // STAGE 1: Soft Restriction
                    lock = false; // Not fully locked, but policy restrictions apply
                    lockStage = 1;
                    lockMessage = `Payment Due. Please make payment.`;
                    allowedApps = ['com.whatsapp', 'com.android.phone', 'com.vistalock.pay']; // Block games/social
                } else {
                    // STAGE 0: Normal
                    lockStage = 0;
                }
            }
        }

        // Return Policy Object (JSON that the Android App understands)
        return {
            imei,
            lock,
            lockStage,
            lockMessage,
            syncInterval: lock ? 15 : 60, // check more often if locked
            allowedApps: lockStage > 0 ? allowedApps : ['*'], // * means all allowed
            emergencyNumber: "911"
        };
    }

    async heartbeat(data: { imei: string; batteryLevel?: number; location?: any; currentLockState?: boolean }) {
        const device = await this.prisma.device.findUnique({ where: { imei: data.imei } });
        if (!device) throw new NotFoundException('Device not found');

        // Update heartbeat
        await this.prisma.device.update({
            where: { imei: data.imei },
            data: {
                lastHeartbeat: new Date(),
                // could store battery/location in a separate `DeviceLog` table if needed
            }
        });

        return { status: 'OK', serverTime: new Date() };
    }
}
