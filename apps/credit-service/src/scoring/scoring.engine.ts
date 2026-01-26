import { Injectable, Logger } from '@nestjs/common';

export interface CreditFactors {
    identityConfidence: number;      // 0-100
    phoneStability: number;           // 0-100
    bnplHistory: number;              // 0-100
    devicePriceRatio: number;         // 0-100
    merchantRiskProfile: number;      // 0-100
}

export interface ScoringResult {
    score: number;                    // 0-1000
    decision: 'APPROVED' | 'APPROVED_WITH_LIMITS' | 'REJECTED';
    maxDeviceValue: number;
    minDownPayment: number;
    allowedTenure: number[];
    interestRate: number;
    creditRating: string;
}

@Injectable()
export class ScoringEngine {
    private readonly logger = new Logger(ScoringEngine.name);

    // Scoring weights (configurable)
    private readonly weights = {
        identityConfidence: 0.30,
        phoneStability: 0.15,
        bnplHistory: 0.25,
        devicePriceRatio: 0.15,
        merchantRiskProfile: 0.15,
    };

    /**
     * Calculate credit score from factors
     */
    calculateScore(factors: CreditFactors): number {
        const score =
            (factors.identityConfidence * this.weights.identityConfidence) +
            (factors.phoneStability * this.weights.phoneStability) +
            (factors.bnplHistory * this.weights.bnplHistory) +
            (factors.devicePriceRatio * this.weights.devicePriceRatio) +
            (factors.merchantRiskProfile * this.weights.merchantRiskProfile);

        const finalScore = Math.round(score * 10); // Scale to 0-1000

        this.logger.log(`Calculated credit score: ${finalScore}`);
        this.logger.debug(`Factors: ${JSON.stringify(factors)}`);

        return finalScore;
    }

    /**
     * Make credit decision based on score
     */
    makeDecision(score: number, requestedPrice: number): ScoringResult {
        let decision: 'APPROVED' | 'APPROVED_WITH_LIMITS' | 'REJECTED';
        let maxDeviceValue: number;
        let minDownPayment: number;
        let allowedTenure: number[];
        let interestRate: number;
        let creditRating: string;

        if (score >= 750) {
            // EXCELLENT CREDIT
            decision = 'APPROVED';
            maxDeviceValue = 1000000;
            minDownPayment = requestedPrice * 0.20; // 20%
            allowedTenure = [3, 6, 9, 12];
            interestRate = 0.025; // 2.5% per month
            creditRating = 'EXCELLENT';
        } else if (score >= 650) {
            // GOOD CREDIT
            decision = 'APPROVED';
            maxDeviceValue = 500000;
            minDownPayment = requestedPrice * 0.25; // 25%
            allowedTenure = [3, 6, 9];
            interestRate = 0.030; // 3.0% per month
            creditRating = 'GOOD';
        } else if (score >= 500) {
            // FAIR CREDIT - APPROVED WITH LIMITS
            decision = 'APPROVED_WITH_LIMITS';
            maxDeviceValue = 250000;
            minDownPayment = requestedPrice * 0.35; // 35%
            allowedTenure = [3, 6];
            interestRate = 0.035; // 3.5% per month
            creditRating = 'FAIR';
        } else {
            // POOR CREDIT - REJECTED
            decision = 'REJECTED';
            maxDeviceValue = 0;
            minDownPayment = 0;
            allowedTenure = [];
            interestRate = 0;
            creditRating = 'POOR';
        }

        this.logger.log(`Decision: ${decision} (Score: ${score}, Rating: ${creditRating})`);

        return {
            score,
            decision,
            maxDeviceValue,
            minDownPayment,
            allowedTenure,
            interestRate,
            creditRating,
        };
    }

    /**
     * Calculate identity confidence factor
     */
    calculateIdentityConfidence(ninVerified: boolean, bvnVerified: boolean, nameMatch: boolean, phoneMatch: boolean): number {
        let confidence = 0;

        if (ninVerified) confidence += 40;
        if (bvnVerified) confidence += 30;
        if (nameMatch) confidence += 20;
        if (phoneMatch) confidence += 10;

        return Math.min(confidence, 100);
    }

    /**
     * Calculate phone stability factor
     */
    calculatePhoneStability(phoneAge: number): number {
        // phoneAge in months
        if (phoneAge >= 12) return 100;
        if (phoneAge >= 6) return 75;
        if (phoneAge >= 3) return 50;
        return 25;
    }

    /**
     * Calculate BNPL history factor
     */
    calculateBNPLHistory(previousLoans: number, defaults: number, onTimePayments: number): number {
        if (previousLoans === 0) return 50; // Neutral for new customers

        const defaultRate = defaults / previousLoans;
        const onTimeRate = onTimePayments / previousLoans;

        if (defaultRate > 0.2) return 0; // More than 20% defaults
        if (defaultRate > 0.1) return 30; // 10-20% defaults
        if (onTimeRate > 0.9) return 100; // 90%+ on-time
        if (onTimeRate > 0.7) return 75; // 70-90% on-time

        return 50;
    }

    /**
     * Calculate device price ratio factor
     */
    calculateDevicePriceRatio(devicePrice: number, estimatedIncome: number): number {
        const ratio = devicePrice / estimatedIncome;

        if (ratio < 0.3) return 100; // Device is < 30% of income
        if (ratio < 0.5) return 75;  // Device is 30-50% of income
        if (ratio < 0.7) return 50;  // Device is 50-70% of income
        if (ratio < 1.0) return 25;  // Device is 70-100% of income

        return 0; // Device exceeds income
    }

    /**
     * Calculate merchant risk profile factor
     */
    calculateMerchantRiskProfile(merchantDefaultRate: number, merchantVolume: number): number {
        let score = 50; // Base score

        // Adjust based on merchant default rate
        if (merchantDefaultRate < 0.05) score += 30; // < 5% default rate
        else if (merchantDefaultRate < 0.10) score += 15; // 5-10% default rate
        else if (merchantDefaultRate > 0.20) score -= 30; // > 20% default rate

        // Adjust based on merchant volume (more volume = more reliable)
        if (merchantVolume > 1000) score += 20;
        else if (merchantVolume > 500) score += 10;
        else if (merchantVolume < 50) score -= 10;

        return Math.max(0, Math.min(100, score));
    }
}
