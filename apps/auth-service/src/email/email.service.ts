import { Injectable } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

@Injectable()
export class EmailService {
    private mg: any;
    private domain: string;

    constructor() {
        // Mailgun Configuration
        const mailgun = new Mailgun(FormData);
        this.mg = mailgun.client({
            username: 'api',
            key: process.env.MAILGUN_API_KEY || '',
        });
        this.domain = process.env.MAILGUN_DOMAIN || '';
    }

    async sendApplicationConfirmation(email: string, businessName: string) {
        const subject = 'VistaLock Merchant Application Received';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Application Received!</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${businessName},</p>
                        <p>Thank you for submitting your merchant application to VistaLock.</p>
                        <p><strong>What happens next?</strong></p>
                        <ul>
                            <li>Our team will review your application within <strong>48 hours</strong></li>
                            <li>We'll verify your business details and documentation</li>
                            <li>You'll receive an email notification with the decision</li>
                        </ul>
                        <p>If approved, you'll receive an activation link to set up your merchant dashboard.</p>
                        <p>If you have any questions, please contact us at <a href="mailto:support@vistalock.com">support@vistalock.com</a></p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} VistaLock. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await this.mg.messages.create(this.domain, {
                from: `VistaLock <noreply@${this.domain}>`,
                to: [email],
                subject,
                html,
            });
        } catch (error) {
            console.error('Mailgun send error:', error);
            throw error;
        }
    }

    async sendApprovalEmail(email: string, businessName: string, activationToken: string) {
        const activationUrl = `${process.env.FRONTEND_URL}/activate?token=${activationToken}&type=merchant`;
        const subject = '🎉 Your VistaLock Merchant Application is Approved!';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Application Approved!</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${businessName},</p>
                        <p>Congratulations! Your merchant application has been <strong>approved</strong>.</p>
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Click the activation button below to activate your account</li>
                            <li>Set up your merchant dashboard</li>
                            <li>Start onboarding customers and managing devices</li>
                        </ol>
                        <div style="text-align: center;">
                            <a href="${activationUrl}" class="button">Activate My Account</a>
                        </div>
                        <div class="warning">
                            <strong>⚠️ Important:</strong> This activation link will expire in 7 days. Please activate your account as soon as possible.
                        </div>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #6b7280;">${activationUrl}</p>
                        <p>Welcome to VistaLock! We're excited to have you on board.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} VistaLock. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await this.mg.messages.create(this.domain, {
                from: `VistaLock <noreply@${this.domain}>`,
                to: [email],
                subject,
                html,
            });
        } catch (error) {
            console.error('Mailgun send error:', error);
            throw error;
        }
    }

    async sendRejectionEmail(email: string, businessName: string, reason: string) {
        const subject = 'VistaLock Merchant Application Update';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                    .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Application Status Update</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${businessName},</p>
                        <p>Thank you for your interest in becoming a VistaLock merchant.</p>
                        <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
                        <div class="reason-box">
                            <strong>Reason:</strong><br>
                            ${reason}
                        </div>
                        <p>If you believe this decision was made in error or would like to reapply in the future, please contact us at <a href="mailto:support@vistalock.com">support@vistalock.com</a></p>
                        <p>We appreciate your understanding.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} VistaLock. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await this.mg.messages.create(this.domain, {
                from: `VistaLock <noreply@${this.domain}>`,
                to: [email],
                subject,
                html,
            });
        } catch (error) {
            console.error('Mailgun send error:', error);
            throw error;
        }
    }

    async sendOpsAdminNotification(businessName: string) {
        const subject = `[ACTION REQUIRED] New Merchant Application: ${businessName}`;
        const html = `
            <p>New merchant application received from <strong>${businessName}</strong>.</p>
            <p>Please log in to the Admin Dashboard to perform the Operations Review.</p>
        `;
        // In a real system, this would go to ops-admin@vistalock.com
        await this.sendAdminEmail(subject, html);
    }

    async sendRiskAdminNotification(businessName: string) {
        const subject = `[ACTION REQUIRED] Ops Review Complete: ${businessName}`;
        const html = `
            <p>Operations review completed for <strong>${businessName}</strong>.</p>
            <p>Please log in to perform the Risk Assessment.</p>
        `;
        // In a real system, this would go to risk-admin@vistalock.com
        await this.sendAdminEmail(subject, html);
    }

    async sendSuperAdminNotification(businessName: string) {
        const subject = `[ACTION REQUIRED] Risk Review Complete: ${businessName}`;
        const html = `
            <p>Risk assessment completed for <strong>${businessName}</strong>.</p>
            <p>Please log in to perform Final Approval.</p>
        `;
        // In a real system, this would go to super-admin@vistalock.com
        await this.sendAdminEmail(subject, html);
    }

    private async sendAdminEmail(subject: string, htmlContent: string) {
        // Default admin email
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@vistalock.com';

        const html = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #1f2937;">VistaLock Admin Notification</h2>
                    <div style="background: white; padding: 20px; border-radius: 4px; margin-top: 10px;">
                        ${htmlContent}
                    </div>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">This is an automated system notification.</p>
                </div>
            </body>
            </html>
        `;

        try {
            await this.mg.messages.create(this.domain, {
                from: `VistaLock System <system@${this.domain}>`,
                to: [adminEmail],
                subject,
                html,
            });
        } catch (error) {
            console.error('Failed to send admin notification:', error);
            // Don't throw, just log
        }
    }
}
