
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface CreditScoreResult {
    score: number;
    decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    maxDeviceValue?: number;
    reasons?: string[];
}

@Injectable()
export class CreditServiceAdapter {
    private readonly logger = new Logger(CreditServiceAdapter.name);
    // TODO: Move URL to ConfigService
    private readonly creditServiceUrl = process.env.CREDIT_SERVICE_URL || 'http://localhost:3004';

    async assessMerchantRisk(application: any): Promise<CreditScoreResult> {
        try {
            this.logger.log(`Requesting Credit Check for Merchant: ${application.id}`);

            // Map Application to Credit DTO
            const payload = {
                merchantId: application.id, // Using App ID as proxy if User not created
                customer: {
                    fullName: application.contactName,
                    phoneNumber: application.phone,
                    nin: (application.directors?.[0] as any)?.idNumber || 'NO_NIN',
                    bvn: (application.bankDetails as any)?.bvn
                },
                requestedProduct: {
                    category: 'MERCHANT_ONBOARDING',
                    price: 0 // Not product specific, but merchant Limit check
                }
            };

            // Call Credit Microservice
            // Note: In real world, we might use a specific 'merchant-score' endpoint.
            // Reusing checkEligibility for now.
            const { data } = await axios.post(`${this.creditServiceUrl}/credit/eligibility`, payload);

            return {
                score: data.decision?.creditRating === 'A' ? 800 : 600, // Mock mapping
                decision: data.status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
                maxDeviceValue: data.decision?.maxDeviceValue,
                reasons: data.decision?.message ? [data.decision.message] : []
            };

        } catch (error) {
            this.logger.error(`Credit Service call failed: ${error.message}`);
            // Fallback to Manual
            return { score: 0, decision: 'MANUAL_REVIEW', reasons: ['Service Unavailable'] };
        }
    }
}
