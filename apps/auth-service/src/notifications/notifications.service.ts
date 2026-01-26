import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
    private twilioClient: any;
    private twilioEnabled: boolean;

    constructor() {
        // Initialize Twilio if credentials are provided
        this.twilioEnabled = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

        if (this.twilioEnabled) {
            try {
                const twilio = require('twilio');
                this.twilioClient = twilio(
                    process.env.TWILIO_ACCOUNT_SID,
                    process.env.TWILIO_AUTH_TOKEN
                );
                console.log('✅ Twilio SMS service initialized');
            } catch (error) {
                console.warn('⚠️  Twilio not installed. Install with: npm install twilio');
                this.twilioEnabled = false;
            }
        } else {
            console.log('ℹ️  Twilio not configured. SMS notifications will be logged to console.');
        }
    }

    /**
     * Send activation SMS to agent
     */
    async sendActivationSMS(phoneNumber: string, activationLink: string, agentName: string) {
        const message = `Hi ${agentName}! Welcome to VistaLock Agent.\n\nActivate your account:\n${activationLink}\n\nExpires in 24 hours.`;

        if (this.twilioEnabled) {
            try {
                const result = await this.twilioClient.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });

                console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
                return { success: true, sid: result.sid };
            } catch (error) {
                console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);

                // Fallback to development log
                console.log('\n📱 SMS FALLBACK (Twilio Failed)');
                console.log('='.repeat(60));
                console.log(`To: ${phoneNumber}`);
                console.log(`Message:\n${message}`);
                console.log('='.repeat(60) + '\n');

                return { success: false, error: error.message, mode: 'fallback' };
            }
        } else {
            // Log to console for development
            console.log('\n📱 SMS NOTIFICATION (Development Mode)');
            console.log('='.repeat(60));
            console.log(`To: ${phoneNumber}`);
            console.log(`Message:\n${message}`);
            console.log('='.repeat(60) + '\n');

            return { success: true, mode: 'development' };
        }
    }

    /**
     * Send activation email to agent (optional)
     */
    async sendActivationEmail(email: string, activationLink: string, agentName: string) {
        // For MVP, just log to console
        // In production, integrate with SendGrid, AWS SES, etc.

        const emailContent = `
Hi ${agentName},

Welcome to VistaLock Agent Platform!

You've been invited to join as an agent. To activate your account and download the app:

${activationLink}

This link will expire in 24 hours.

If you didn't expect this invitation, please ignore this email.

Best regards,
VistaLock Team
        `;

        console.log('\n📧 EMAIL NOTIFICATION (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email}`);
        console.log(`Subject: Activate Your VistaLock Agent Account`);
        console.log(`Body:\n${emailContent}`);
        console.log('='.repeat(60) + '\n');

        return { success: true, mode: 'development' };
    }

    /**
     * Send OTP for agent activation
     */
    async sendOTP(phoneNumber: string, otp: string) {
        const message = `Your VistaLock verification code is: ${otp}\n\nValid for 10 minutes.`;

        if (this.twilioEnabled) {
            try {
                const result = await this.twilioClient.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });

                console.log(`✅ OTP sent to ${phoneNumber}: ${result.sid}`);
                return { success: true, sid: result.sid };
            } catch (error) {
                console.error(`❌ Failed to send OTP to ${phoneNumber}:`, error.message);

                // Fallback to development log
                console.log('\n📱 OTP FALLBACK (Twilio Failed)');
                console.log('='.repeat(60));
                console.log(`To: ${phoneNumber}`);
                console.log(`OTP: ${otp}`);
                console.log('='.repeat(60) + '\n');

                return { success: false, error: error.message, mode: 'fallback', otp };
            }
        } else {
            console.log('\n📱 OTP SMS (Development Mode)');
            console.log('='.repeat(60));
            console.log(`To: ${phoneNumber}`);
            console.log(`OTP: ${otp}`);
            console.log('='.repeat(60) + '\n');

            return { success: true, mode: 'development', otp }; // Return OTP in dev mode
        }
    }
}
