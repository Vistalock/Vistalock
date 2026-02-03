
import { Injectable, Logger } from '@nestjs/common';

export interface CACVerificationResult {
    isValid: boolean;
    companyName?: string;
    rcNumber?: string;
    reason?: string;
}

export interface BankVerificationResult {
    isValid: boolean;
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    reason?: string;
}

@Injectable()
export class ExternalVerificationService {
    private readonly logger = new Logger(ExternalVerificationService.name);

    /**
     * MOCK: Verifies a CAC (RC) Number against external registry (e.g. CAC API via Dojah)
     */
    async verifyCAC(cacNumber: string): Promise<CACVerificationResult> {
        this.logger.log(`Verifying CAC Number: ${cacNumber}`);

        // MOCK LOGIC
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));

        // 1. Simulator: Specific INVALID pattern
        if (cacNumber.toUpperCase().startsWith('INVALID') || cacNumber === '000000') {
            return {
                isValid: false,
                reason: 'CAC Number not found in registry (MOCK)'
            };
        }

        // 2. Simulator: Valid case
        return {
            isValid: true,
            companyName: 'MOCK COMPANY LTD',
            rcNumber: cacNumber
        };
    }

    /**
     * MOCK: Verifies Bank Account Details (e.g. Paystack/Flutterwave/Monnify Resolve API)
     */
    async verifyBankAccount(accountNumber: string, bankName: string): Promise<BankVerificationResult> {
        this.logger.log(`Verifying Bank Account: ${accountNumber} @ ${bankName}`);

        // MOCK LOGIC
        await new Promise(resolve => setTimeout(resolve, 500));

        // 1. Simulator: Invalid Account Pattern (e.g. starts with 000)
        if (accountNumber.startsWith('000') || accountNumber.length !== 10) {
            return {
                isValid: false,
                reason: 'Invalid account number or bank details (MOCK)'
            };
        }

        // 2. Simulator: Valid case
        return {
            isValid: true,
            accountName: 'MOCK MERCHANT ACCOUNT',
            accountNumber: accountNumber,
            bankName: bankName
        };
    }
}
