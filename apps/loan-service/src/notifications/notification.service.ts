/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    async sendSms(to: string, message: string): Promise<void> {
        // In production, integration with Twilio/Termii would go here.
        // implementing "Mock" strategy for now.
        this.logger.log(`[SMS] To: ${to} | Message: ${message}`);
    }

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        // In production, integrate with SendGrid/AWS SES
        this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
        this.logger.debug(`[EMAIL BODY]: ${body}`);
    }

    async sendDeviceUnlockAlert(phone: string, deviceId: string) {
        await this.sendSms(phone, `Vistalock: Payment received. Your device ${deviceId} has been unlocked. Thank you!`);
    }

    async sendDeviceLockAlert(phone: string, deviceId: string) {
        await this.sendSms(phone, `Vistalock: Payment Overdue. Your device ${deviceId} is now LOCKED. Pay immediately to restore access.`);
    }

    async sendPaymentReminder(phone: string, amount: number, dueDate: Date) {
        await this.sendSms(phone, `Vistalock: Reminder. Please pay NGN ${amount} by ${dueDate.toDateString()} to avoid device locking.`);
    }
}
