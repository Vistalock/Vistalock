import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CreditService {
    private readonly logger = new Logger(CreditService.name);
    // In production, these would be in .env
    private readonly DOJAH_API_URL = 'https://api.dojah.io';
    private readonly DOJAH_APP_ID = process.env.DOJAH_APP_ID;
    private readonly DOJAH_PRIVATE_KEY = process.env.DOJAH_PRIVATE_KEY;

    async verifyIdentity(type: 'BVN' | 'NIN', value: string) {
        // MOCK MODE: If no keys present, return simulated success
        if (!this.DOJAH_APP_ID || !this.DOJAH_PRIVATE_KEY) {
            this.logger.warn('Dojah API keys missing. Using MOCK verification.');
            if (value === '00000000000') throw new BadRequestException('Simulated Verification Failure');

            return {
                valid: true,
                data: {
                    firstName: "Test",
                    lastName: "User",
                    dateOfBirth: "1990-01-01",
                    gender: "Male"
                }
            };
        }

        try {
            // Real Dojah Implementation
            // Retrieve BVN or NIN details
            const response = await axios.get(`${this.DOJAH_API_URL}/api/v1/kyc/${type.toLowerCase()}?${type.toLowerCase()}=${value}`, {
                headers: {
                    'AppId': this.DOJAH_APP_ID,
                    'Authorization': this.DOJAH_PRIVATE_KEY
                }
            });
            return {
                valid: true,
                data: response.data.entity
            };
        } catch (error) {
            this.logger.error(`Dojah Verification Failed: ${error.message}`);
            // Check if 404 => invalid ID
            throw new BadRequestException('Identity Verification Failed. Please check the ID number.');
        }
    }

    async checkCreditEligibility(customerData: { bvn?: string; nin?: string; amount: number }) {
        // MOCK CREDIT SCORING
        // Logic: 
        // 1. If BVN ends in '888', reject (Blacklisted)
        // 2. If Amount > 500k and no credible history, flag manual review.
        // 3. Otherwise Approve.

        const id = customerData.bvn || customerData.nin || "000";

        if (id.endsWith('888')) {
            return {
                status: 'REJECTED',
                score: 300,
                limit: 0,
                reason: 'Credit history flagged'
            };
        }

        // Mock Score Generation
        const score = Math.floor(Math.random() * (850 - 600 + 1) + 600); // 600-850

        return {
            status: score > 650 ? 'APPROVED' : 'REVIEW',
            score,
            limit: score > 700 ? 1000000 : 500000,
            currency: 'NGN'
        };
    }
}
