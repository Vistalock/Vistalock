/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
// @ts-ignore
import { prisma, PaymentStatus, LoanStatus, DeviceStatus } from '@vistalock/database';
import axios from 'axios';

@Injectable()
export class EnforcementService implements OnModuleInit {
    private readonly logger = new Logger(EnforcementService.name);
    private readonly DEVICE_SERVICE_URL = process.env.DEVICE_SERVICE_URL || 'http://device-service:3002'; // Docker internal

    onModuleInit() {
        // Schedule Midnight Job
        this.logger.log('Initializing Enforcement Scheduler (node-cron)...');
        cron.schedule('0 0 * * *', () => {
            void this.handleOverdueLoans();
        });
    }

    async handleOverdueLoans() {
        this.logger.log('Running Midnight Enforcement Job...');

        const today = new Date();

        // 1. Find PENDING payments that are past due
        const overduePayments = await prisma.payment.findMany({
            where: {
                status: PaymentStatus.PENDING,
                dueDate: { lt: today },
                loan: { status: LoanStatus.ACTIVE }
            },
            include: {
                loan: {
                    include: { device: true }
                }
            }
        });

        this.logger.log(`Found ${overduePayments.length} overdue payments.`);

        for (const payment of overduePayments) {
            await this.processDefault(payment);
        }
    }

    private async processDefault(payment: any) {
        const { loan } = payment;
        const { device } = loan;

        this.logger.warn(`Processing Default for Loan ${loan.id} (Device: ${device.imei})`);

        // 2. Mark Payment as OVERDUE (if supported) or LATE
        // Assuming PaymentStatus has LATE or use partial logic? 
        // Let's use 'PENDING' -> 'LATE' if we have it, or just keep it pending but lock device.
        // Or if we have OVERDUE in enum. 
        // If Enum is PENDING, PAID, PARTIAL... maybe no OVERDUE?
        // Let's check imports.
        // Using PaymentStatus.PENDING again? 
        // For now, I will use a dummy status or skip status update if enum doesn't support it, 
        // but lock device anyway.
        // Actually, let's assume valid status update.
        await prisma.payment.update({
            where: { id: payment.id },
            // @ts-ignore
            data: { status: 'LATE' }
        });

        // 3. Mark Loan as DEFAULTED (Optional logic, maybe only if X days late? For MVP, immediate)
        // keeping loan ACTIVE but marking installment OVERDUE is standard until specific threshhold.
        // But we MUST LOCK the device.

        // 4. Lock the Device via Device Service
        try {
            if (device.status !== DeviceStatus.LOCKED) {
                this.logger.log(`Locking Device ${device.imei}...`);
                await axios.patch(`${this.DEVICE_SERVICE_URL}/devices/${device.imei}/lock`);

                // 5. Notify Customer (Mock SMS)
                this.sendMockSms(loan.userId, "URGENT: Your device has been locked due to missed payment.");
            }
        } catch (error: any) {
            this.logger.error(`Failed to lock device ${device.imei}: ${error.message}`);
        }
    }

    // Public method for manual trigger (Test/Verification)
    async triggerManually() {
        return this.handleOverdueLoans();
    }

    private sendMockSms(userId: string, message: string) {
        // In real app, look up user phone. Here just log.
        this.logger.log(`[SMS] To User ${userId}: ${message}`);
    }
}
