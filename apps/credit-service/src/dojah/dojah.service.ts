import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface DojahNINVerificationResponse {
    valid: boolean;
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    photo?: string;
}

interface DojahBVNVerificationResponse {
    valid: boolean;
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    phoneNumber: string;
    enrollmentBank: string;
    enrollmentBranch: string;
}

@Injectable()
export class DojahService {
    private readonly logger = new Logger(DojahService.name);
    private readonly client: AxiosInstance;
    private readonly appId: string;
    private readonly apiKey: string;

    constructor(private configService: ConfigService) {
        this.appId = this.configService.get<string>('DOJAH_APP_ID');
        this.apiKey = this.configService.get<string>('DOJAH_API_KEY');

        this.client = axios.create({
            baseURL: 'https://api.dojah.io',
            headers: {
                'AppId': this.appId,
                'Authorization': this.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }

    /**
     * Verify NIN (National Identity Number)
     */
    async verifyNIN(nin: string): Promise<DojahNINVerificationResponse> {
        try {
            this.logger.log(`Verifying NIN: ***${nin.slice(-4)}`);

            const response = await this.client.post('/api/v1/kyc/nin', {
                nin,
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            const data = response.data.entity;

            return {
                valid: true,
                firstName: data.firstname || data.firstName,
                lastName: data.lastname || data.lastName,
                middleName: data.middlename || data.middleName,
                dateOfBirth: data.birthdate || data.dateOfBirth,
                gender: data.gender,
                phoneNumber: data.telephoneno || data.phoneNumber,
                photo: data.photo,
            };
        } catch (error) {
            this.logger.error(`NIN verification failed: ${error.message}`);

            // Return mock data in development
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn('Using mock NIN data for development');
                return {
                    valid: true,
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1990-01-01',
                    gender: 'M',
                    phoneNumber: '08012345678',
                };
            }

            throw error;
        }
    }

    /**
     * Verify BVN (Bank Verification Number)
     */
    async verifyBVN(bvn: string): Promise<DojahBVNVerificationResponse> {
        try {
            this.logger.log(`Verifying BVN: ***${bvn.slice(-4)}`);

            const response = await this.client.post('/api/v1/kyc/bvn', {
                bvn,
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            const data = response.data.entity;

            return {
                valid: true,
                firstName: data.first_name || data.firstName,
                lastName: data.last_name || data.lastName,
                middleName: data.middle_name || data.middleName,
                dateOfBirth: data.date_of_birth || data.dateOfBirth,
                phoneNumber: data.phone_number || data.phoneNumber,
                enrollmentBank: data.enrollment_bank,
                enrollmentBranch: data.enrollment_branch,
            };
        } catch (error) {
            this.logger.error(`BVN verification failed: ${error.message}`);

            // Return mock data in development
            if (process.env.NODE_ENV === 'development') {
                this.logger.warn('Using mock BVN data for development');
                return {
                    valid: true,
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1990-01-01',
                    phoneNumber: '08012345678',
                    enrollmentBank: 'First Bank',
                    enrollmentBranch: 'Lagos',
                };
            }

            throw error;
        }
    }

    /**
     * Validate phone number
     */
    async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
        try {
            const response = await this.client.post('/api/v1/kyc/phone_number', {
                phone_number: phoneNumber,
            });

            return response.data.entity?.valid || false;
        } catch (error) {
            this.logger.error(`Phone validation failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Check if names match (fuzzy matching)
     */
    matchNames(provided: string, verified: string): boolean {
        const normalize = (name: string) =>
            name.toLowerCase().trim().replace(/[^a-z\s]/g, '');

        const providedNorm = normalize(provided);
        const verifiedNorm = normalize(verified);

        // Exact match
        if (providedNorm === verifiedNorm) {
            return true;
        }

        // Check if one contains the other (for middle names)
        if (providedNorm.includes(verifiedNorm) || verifiedNorm.includes(providedNorm)) {
            return true;
        }

        // Calculate similarity (simple approach)
        const similarity = this.calculateSimilarity(providedNorm, verifiedNorm);
        return similarity > 0.8; // 80% similarity threshold
    }

    /**
     * Calculate string similarity (Levenshtein distance)
     */
    private calculateSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 1.0;
        }

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Levenshtein distance algorithm
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }
}
