import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@vistalock/database';

@Injectable()
export class AdminConfigService {
    private prisma = new PrismaClient();

    async getConfig() {
        // Fetch singleton config (create if not exists)
        let config = await this.prisma.systemConfig.findFirst();
        if (!config) {
            config = await this.prisma.systemConfig.create({
                data: {
                    defaultGracePeriod: 3,
                    currency: 'NGN',
                    strictMode: true,
                    offlineLocking: true,
                    emergencyPause: false,
                    supportEmail: 'support@vistalock.com',
                    emergencyPhone: '+234 800 VISTA',
                    // Defaults
                    lockEscalationStages: ["REMINDER", "SOFT_LOCK", "FULL_LOCK"],
                    lockRetryFrequency: 24,
                    offlineLockTimeout: 168,
                    autoUnlockOnPayment: true,
                    supportedDeviceTypes: ["ANDROID"],
                    minAgentVersion: "1.0.0",
                    defaultInterestRate: 0.0,
                    defaultMaxTenure: 12
                }
            });
        }
        return config;
    }

    async updateConfig(data: any) {
        // Validation should ideally happen here using DTOs
        const config = await this.getConfig();
        return this.prisma.systemConfig.update({
            where: { id: config.id },
            data: {
                defaultGracePeriod: data.defaultGracePeriod ? Number(data.defaultGracePeriod) : undefined,
                currency: data.currency,
                strictMode: data.strictMode,
                offlineLocking: data.offlineLocking,
                emergencyPause: data.emergencyPause,
                supportEmail: data.supportEmail,
                emergencyPhone: data.emergencyPhone,

                // New Fields
                lockEscalationStages: data.lockEscalationStages,
                lockRetryFrequency: data.lockRetryFrequency ? Number(data.lockRetryFrequency) : undefined,
                offlineLockTimeout: data.offlineLockTimeout ? Number(data.offlineLockTimeout) : undefined,
                autoUnlockOnPayment: data.autoUnlockOnPayment,
                supportedDeviceTypes: data.supportedDeviceTypes,
                minAgentVersion: data.minAgentVersion,
                defaultInterestRate: data.defaultInterestRate,
                defaultMaxTenure: data.defaultMaxTenure ? Number(data.defaultMaxTenure) : undefined
            }
        });
    }
}
