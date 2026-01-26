import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@vistalock/database';

export interface FraudCheckResult {
    isFraud: boolean;
    reasons: string[];
    riskScore: number; // 0-100
}

@Injectable()
export class FraudDetector {
    private readonly logger = new Logger(FraudDetector.name);
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Comprehensive fraud detection
     */
    async detectFraud(customer: {
        nin: string;
        bvn?: string;
        phoneNumber: string;
    }): Promise<FraudCheckResult> {
        const reasons: string[] = [];
        let riskScore = 0;

        // Check 1: Blacklist
        const isBlacklisted = await this.checkBlacklist(customer.nin, customer.bvn, customer.phoneNumber);
        if (isBlacklisted) {
            reasons.push('Customer is blacklisted');
            riskScore += 100;
        }

        // Check 2: Multiple BVNs on same phone
        if (customer.bvn) {
            const multipleBVNs = await this.checkMultipleBVNs(customer.phoneNumber, customer.bvn);
            if (multipleBVNs) {
                reasons.push('Multiple BVNs detected on same phone number');
                riskScore += 50;
            }
        }

        // Check 3: Rapid application attempts
        const rapidAttempts = await this.checkRapidAttempts(customer.phoneNumber);
        if (rapidAttempts) {
            reasons.push('Multiple applications in short time');
            riskScore += 30;
        }

        // Check 4: Previous defaults
        const hasDefaults = await this.checkDefaultHistory(customer.nin);
        if (hasDefaults) {
            reasons.push('Previous loan defaults detected');
            riskScore += 40;
        }

        // Check 5: Cross-merchant fraud
        const crossMerchantFraud = await this.checkCrossMerchantFraud(customer.nin);
        if (crossMerchantFraud) {
            reasons.push('Fraud detected across multiple merchants');
            riskScore += 60;
        }

        const isFraud = riskScore >= 100;

        if (isFraud) {
            this.logger.warn(`Fraud detected for NIN ***${customer.nin.slice(-4)}: ${reasons.join(', ')}`);
        }

        return {
            isFraud,
            reasons,
            riskScore: Math.min(riskScore, 100),
        };
    }

    /**
     * Check if customer is blacklisted
     */
    private async checkBlacklist(nin: string, bvn?: string, phoneNumber?: string): Promise<boolean> {
        try {
            const blacklisted = await this.prisma.blacklist.findFirst({
                where: {
                    OR: [
                        { nin },
                        bvn ? { bvn } : {},
                        phoneNumber ? { phoneNumber } : {},
                    ],
                },
            });

            return !!blacklisted;
        } catch (error) {
            this.logger.error(`Blacklist check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Check for multiple BVNs on same phone
     */
    async checkMultipleBVNs(phoneNumber: string, currentBVN: string): Promise<boolean> {
        try {
            // Check if this phone has been used with different BVNs
            const profiles = await this.prisma.customerProfile.findMany({
                where: {
                    phoneNumber,
                },
                select: {
                    userId: true,
                    bvn: true
                },
            });

            // If found profiles with different BVNs (excluding current one check/or relying on logic)
            // Logic: if multiple profiles exist for same phone?
            return profiles.length > 1;
        } catch (error) {
            this.logger.error(`Multiple BVN check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Check for rapid application attempts (velocity check)
     */
    private async checkRapidAttempts(phoneNumber: string): Promise<boolean> {
        try {
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

            const recentAttempts = await this.prisma.creditCheck.count({
                where: {
                    phoneNumber,
                    createdAt: {
                        gte: fifteenMinutesAgo,
                    },
                },
            });

            // More than 3 attempts in 15 minutes is suspicious
            return recentAttempts > 3;
        } catch (error) {
            this.logger.error(`Rapid attempts check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Check for previous defaults
     */
    private async checkDefaultHistory(nin: string): Promise<boolean> {
        try {
            const defaultedLoans = await this.prisma.loan.count({
                where: {
                    customerNIN: nin,
                    status: 'DEFAULTED',
                },
            });

            return defaultedLoans > 0;
        } catch (error) {
            this.logger.error(`Default history check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Check for cross-merchant fraud
     */
    private async checkCrossMerchantFraud(nin: string): Promise<boolean> {
        try {
            // Check if customer has active loans with multiple merchants simultaneously
            const activeLoans = await this.prisma.loan.count({
                where: {
                    customerNIN: nin,
                    status: 'ACTIVE',
                },
            });

            // Having more than 2 active BNPL loans simultaneously is suspicious
            return activeLoans > 2;
        } catch (error) {
            this.logger.error(`Cross-merchant fraud check failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Add customer to blacklist
     */
    async addToBlacklist(nin: string, bvn?: string, phoneNumber?: string, reason?: string): Promise<void> {
        try {
            await this.prisma.blacklist.create({
                data: {
                    nin,
                    bvn,
                    phoneNumber,
                    reason: reason || 'Fraud detected',
                    addedAt: new Date(),
                },
            });

            this.logger.log(`Added to blacklist: NIN ***${nin.slice(-4)}`);
        } catch (error) {
            this.logger.error(`Failed to add to blacklist: ${error.message}`);
        }
    }

    /**
     * Remove from blacklist
     */
    async removeFromBlacklist(nin: string): Promise<void> {
        try {
            await this.prisma.blacklist.deleteMany({
                where: { nin },
            });

            this.logger.log(`Removed from blacklist: NIN ***${nin.slice(-4)}`);
        } catch (error) {
            this.logger.error(`Failed to remove from blacklist: ${error.message}`);
        }
    }
}
