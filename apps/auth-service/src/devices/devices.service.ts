import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common';
// @ts-ignore
import { PrismaClient, DeviceStatus } from '@vistalock/database';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class DevicesService {
    private readonly logger = new Logger(DevicesService.name);
    private prisma: PrismaClient;

    constructor(private billingService: BillingService) {
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
                },
                enrollmentBilling: true
            }
        });
    }

    async findOne(merchantId: string, imei: string) {
        return this.prisma.device.findFirst({
            where: { merchantId, imei },
            include: {
                loans: true,
                enrollmentBilling: true
            }
        });
    }

    /**
     * Create and enroll a device with automatic billing
     */
    async create(merchantId: string, data: { imei: string; model: string }) {
        const existing = await this.prisma.device.findUnique({ where: { imei: data.imei } });
        if (existing) {
            throw new ConflictException('Device with this IMEI already exists');
        }

        // Create device first
        const device = await this.prisma.device.create({
            data: {
                imei: data.imei,
                model: data.model,
                merchantId: merchantId,
                status: 'PENDING_SETUP'
            }
        });

        this.logger.log(`Device created: ${device.imei}`);

        // Process enrollment billing
        try {
            const billingResult = await this.billingService.processEnrollmentBilling(
                merchantId,
                device.id
            );

            if (!billingResult.success) {
                // Billing failed - device created but not fully enrolled
                this.logger.warn(`Enrollment billing failed for device ${device.imei}: ${billingResult.message}`);

                return {
                    device,
                    billingStatus: 'PENDING',
                    billingMessage: billingResult.message,
                    warning: 'Device created but enrollment fee not charged. Please top up your wallet.'
                };
            }

            // Billing successful - update device status
            const updatedDevice = await this.prisma.device.update({
                where: { id: device.id },
                data: { status: DeviceStatus.UNLOCKED },
                include: { enrollmentBilling: true }
            });

            this.logger.log(`Device enrolled successfully: ${device.imei}, Fee: ₦${billingResult.billing.amount}`);

            return {
                device: updatedDevice,
                billingStatus: 'PAID',
                billingMessage: billingResult.message,
                enrollmentFee: billingResult.billing.amount,
                tier: billingResult.billing.tier
            };

        } catch (error) {
            this.logger.error(`Error processing enrollment billing for device ${device.imei}:`, error);

            // Return device with error info
            return {
                device,
                billingStatus: 'ERROR',
                billingMessage: 'Error processing enrollment fee',
                error: error.message
            };
        }
    }

    /**
     * Retry enrollment billing for a device with pending billing
     */
    async retryEnrollmentBilling(merchantId: string, deviceId: string) {
        const device = await this.prisma.device.findFirst({
            where: { id: deviceId, merchantId },
            include: { enrollmentBilling: true }
        });

        if (!device) {
            throw new BadRequestException('Device not found');
        }

        if (device.enrollmentBilling && device.enrollmentBilling.status === 'PAID') {
            throw new BadRequestException('Device enrollment already paid');
        }

        // Process billing
        const billingResult = await this.billingService.processEnrollmentBilling(
            merchantId,
            device.id
        );

        if (billingResult.success) {
            // Update device status
            await this.prisma.device.update({
                where: { id: device.id },
                data: { status: DeviceStatus.UNLOCKED }
            });
        }

        return billingResult;
    }
}
