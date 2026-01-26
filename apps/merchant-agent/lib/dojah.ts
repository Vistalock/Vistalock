/**
 * Mock DojahService for client-side loan term calculation.
 * In production, this logic should be synchronized with the backend credit-service.
 */

interface LoanTerms {
    minDownPayment: number;
    maxTenure: number;
    interestRate: number;
    tier: string;
}

export default class DojahService {
    /**
     * Get loan terms based on credit score.
     * Higher scores get lower down payments, longer tenures, and lower interest.
     */
    static getLoanTerms(creditScore: number): LoanTerms {
        // Tier A: Excellent Credit (750+)
        if (creditScore >= 750) {
            return {
                minDownPayment: 0.20, // 20%
                maxTenure: 12,
                interestRate: 0.02, // 2% monthly
                tier: 'A'
            };
        }
        // Tier B: Good Credit (650-749)
        else if (creditScore >= 650) {
            return {
                minDownPayment: 0.25, // 25%
                maxTenure: 9,
                interestRate: 0.03, // 3% monthly
                tier: 'B'
            };
        }
        // Tier C: Fair Credit (550-649)
        else if (creditScore >= 550) {
            return {
                minDownPayment: 0.30, // 30%
                maxTenure: 6,
                interestRate: 0.04, // 4% monthly
                tier: 'C'
            };
        }
        // Tier D: Poor Credit (<550) - Should typically be rejected, but if approved:
        else {
            return {
                minDownPayment: 0.40, // 40%
                maxTenure: 3,
                interestRate: 0.05, // 5% monthly
                tier: 'D'
            };
        }
    }
}
