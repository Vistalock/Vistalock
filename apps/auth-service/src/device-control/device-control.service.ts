import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DeviceControlService {
    private readonly logger = new Logger(DeviceControlService.name);

    constructor(private prisma: PrismaService) { }

    // === EXISTING: POLICY PULL (Device asks: "Build me a policy") ===
    async getPolicy(imei: string) {
        // Retrieve the latest "Lock Event" or Current Status
        const device = await this.prisma.device.findUnique({
            where: { imei },
            include: {
                loans: {
                    where: { status: { in: ['ACTIVE', 'DEFAULTED', 'OVERDUE'] as any } }, // Cast for safety if enum mismatches
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!device) throw new NotFoundException('Device not found');

        // Logic:
        // 1. If Device.status == LOCKED, return HIGH RESTRICTION
        // 2. If Device.status == UNLOCKED, return NORMAL
        // 3. If Pending, return SETUP MODE

        // We can also check Loan directly to double-confirm?
        // Let's rely on the `Device.status` as the Source of Truth for the AGENT.
        // The `LoanPartnerService` is responsible for updating `Device.status`.

        const isLocked = device.status === 'LOCKED';

        // Find active loan for metadata (e.g. amount due)
        const loan = device.loans[0];
        const amountDue = loan ? loan.outstandingAmount : 0;
        // @ts-ignore
        const currency = loan ? loan.currency : 'NGN';

        return {
            imei,
            policyVersion: new Date().getTime(), // Force update
            lockState: isLocked ? 'LOCKED' : 'UNLOCKED',

            // UI Config for Agent
            ui: {
                showOverlay: isLocked,
                message: isLocked ? "Device is Locked due to overdue payment." : "Device is Active",
                subMessage: isLocked ? `Outstanding: ${currency} ${amountDue}` : undefined,
                actionButton: isLocked ? "PAY NOW" : "View Loan",
                actionUrl: isLocked ? `https://pay.vistalock.com/pay/${loan?.id}` : undefined // Or Partner link
            },

            // Technical Config
            syncIntervalSeconds: isLocked ? 300 : 3600, // 5 min vs 1 hour
            allowedPackages: isLocked ? ['com.vistalock.agent', 'com.android.settings', 'com.android.phone'] : ['*'],

            // Offline Logic (If server unreachable)
            offlineLockDate: loan?.nextPaymentDue ? new Date(loan.nextPaymentDue).toISOString() : null
        };
    }

    // === NEW: COMMAND PUSH (Server tells Device: "Lock Now") ===
    // Called by LoanPartnerService or Admin
    async sendCommand(imei: string, command: 'LOCK' | 'UNLOCK' | 'SOFT_LOCK', reason: string, trigger: string) {
        this.logger.log(`Executing Command: ${command} on Device ${imei} (Reason: ${reason})`);

        // 1. Update Device Status in DB
        const newStatus = command === 'UNLOCK' ? 'UNLOCKED' : 'LOCKED';

        await this.prisma.device.update({
            where: { imei },
            data: { status: newStatus }
        });

        // 2. Create Audit Log (LockEvent)
        // @ts-ignore
        await this.prisma.lockEvent.create({
            data: {
                deviceImei: imei,
                type: command,
                reason: reason,
                triggeredBy: trigger,
                metadata: { timestamp: new Date() }
            }
        });

        // 3. Push to Fabric / FCM / Socket (MOCK for now)
        // TODO: Integrate Firebase Cloud Messaging here to wake up the device.
        this.fcmPush(imei, { type: 'POLICY_UPDATE' });

        return { status: 'EXECUTED', newStatus };
    }

    private fcmPush(imei: string, payload: any) {
        // Mock FCM
        this.logger.debug(`[MOCK FCM] Sending to ${imei}: ${JSON.stringify(payload)}`);
    }

    async heartbeat(data: { imei: string }) {
        // Simple heartbeat
        await this.prisma.device.update({
            where: { imei: data.imei },
            data: { lastHeartbeat: new Date() }
        });
        return { status: 'OK' };
    }
}
