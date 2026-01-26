import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@vistalock/database';
import { DojahService } from '../dojah/dojah.service';
import { ScoringEngine, CreditFactors } from '../scoring/scoring.engine';
import { FraudDetector } from '../fraud/fraud.detector';
import { EligibilityCheckDto, CreditDecisionDto } from './dto/credit.dto';

@Injectable()
export class CreditService {
    private readonly logger = new Logger(CreditService.name);
    private prisma: PrismaClient;

    constructor(
        private dojahService: DojahService,
        private scoringEngine: ScoringEngine,
        private fraudDetector: FraudDetector,
    ) {
        this.prisma = new PrismaClient();
    }

    /**
     * Main eligibility check endpoint
     */
    async checkEligibility(dto: EligibilityCheckDto): Promise<CreditDecisionDto> {
        const checkId = `CHK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.logger.log(`Starting eligibility check: ${checkId}`);
        this.logger.log(`Customer: ${dto.customer.fullName}, Product: ${dto.requestedProduct.category} (₦${dto.requestedProduct.price})`);

        try {
            // Step 1: Request Validation
            await this.validateRequest(dto);

            // Step 2: Identity Verification (Dojah)
            const identityResult = await this.verifyIdentity(dto.customer);

            if (!identityResult.valid) {
                return this.createRejection(checkId, 'IDENTITY_VERIFICATION_FAILED', 'Identity verification failed');
            }

            // Step 3: Fraud Detection
            const fraudResult = await this.fraudDetector.detectFraud({
                nin: dto.customer.nin,
                bvn: dto.customer.bvn,
                phoneNumber: dto.customer.phoneNumber,
            });

            if (fraudResult.isFraud) {
                this.logger.warn(`Fraud detected: ${fraudResult.reasons.join(', ')}`);
                return this.createRejection(checkId, 'FRAUD_DETECTED', 'Application rejected due to fraud detection');
            }

            // Step 4: Credit Scoring
            const creditFactors = await this.calculateCreditFactors(dto, identityResult);
            const score = this.scoringEngine.calculateScore(creditFactors);

            // Step 5: Merchant Policy Application
            const merchantPolicy = await this.getMerchantPolicy(dto.merchantId);

            // Step 6: Final Decision
            const scoringResult = this.scoringEngine.makeDecision(score, dto.requestedProduct.price);

            // Apply merchant policy limits
            const finalDecision = this.applyMerchantPolicy(scoringResult, merchantPolicy);

            // Check if requested product exceeds limits
            if (dto.requestedProduct.price > finalDecision.maxDeviceValue) {
                return this.createRejection(checkId, 'PRICE_EXCEEDS_LIMIT', `Device price exceeds maximum allowed (₦${finalDecision.maxDeviceValue})`);
            }

            // Step 7: Audit Logging
            await this.logCreditCheck(checkId, dto, finalDecision, score);

            // Return decision
            if (finalDecision.decision === 'REJECTED') {
                return this.createRejection(checkId, 'INSUFFICIENT_CREDIT_PROFILE', 'Customer does not meet minimum requirements');
            }

            return {
                status: finalDecision.decision,
                decision: {
                    approved: true,
                    maxDeviceValue: finalDecision.maxDeviceValue,
                    allowedTenure: finalDecision.allowedTenure,
                    minDownPayment: finalDecision.minDownPayment,
                    interestRate: finalDecision.interestRate,
                    creditRating: finalDecision.creditRating,
                },
                checkId,
            };

        } catch (error) {
            this.logger.error(`Eligibility check failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Validate request
     */
    private async validateRequest(dto: EligibilityCheckDto): Promise<void> {
        // Check if merchant is active
        const merchant = await this.prisma.merchantProfile.findUnique({
            where: { userId: dto.merchantId },
        });

        if (!merchant || merchant.status !== 'APPROVED') {
            // Fallback or strict check?
            // Also check User.isActive
            const user = await this.prisma.user.findUnique({ where: { id: dto.merchantId } });
            if (!user || !user.isActive) {
                throw new BadRequestException('Merchant not found or inactive');
            }
            if (merchant?.status !== 'APPROVED') {
                // warning or block? For now, let's block if not approved
                throw new BadRequestException('Merchant not approved');
            }
        }

        // Check if agent is active
        const agent = await this.prisma.user.findUnique({
            where: { id: dto.agentId },
        });

        if (!agent || agent.role !== 'MERCHANT_AGENT') {
            throw new BadRequestException('Agent not found or invalid');
        }

        // Validate NIN format (11 digits)
        if (!/^\d{11}$/.test(dto.customer.nin)) {
            throw new BadRequestException('Invalid NIN format');
        }

        // Validate phone format
        if (!/^0\d{10}$/.test(dto.customer.phoneNumber)) {
            throw new BadRequestException('Invalid phone number format');
        }
    }

    /**
     * Verify identity using Dojah
     */
    private async verifyIdentity(customer: any): Promise<any> {
        try {
            // Verify NIN
            const ninResult = await this.dojahService.verifyNIN(customer.nin);

            // Verify BVN if provided
            let bvnResult = null;
            if (customer.bvn) {
                bvnResult = await this.dojahService.verifyBVN(customer.bvn);
            }

            // Check name matching
            const fullName = `${customer.fullName}`.toLowerCase();
            const verifiedName = `${ninResult.firstName} ${ninResult.lastName}`.toLowerCase();

            const nameMatch = this.dojahService.matchNames(fullName, verifiedName);

            // Check phone matching
            const phoneMatch = ninResult.phoneNumber === customer.phoneNumber;

            return {
                valid: ninResult.valid && nameMatch,
                ninVerified: ninResult.valid,
                bvnVerified: bvnResult?.valid || false,
                nameMatch,
                phoneMatch,
                verifiedData: ninResult,
            };
        } catch (error) {
            this.logger.error(`Identity verification failed: ${error.message}`);
            return { valid: false };
        }
    }

    /**
     * Calculate credit factors
     */
    private async calculateCreditFactors(dto: EligibilityCheckDto, identityResult: any): Promise<CreditFactors> {
        // Identity confidence
        const identityConfidence = this.scoringEngine.calculateIdentityConfidence(
            identityResult.ninVerified,
            identityResult.bvnVerified,
            identityResult.nameMatch,
            identityResult.phoneMatch
        );

        // Phone stability (mock - would need real data)
        const phoneStability = this.scoringEngine.calculatePhoneStability(6); // Assume 6 months

        // BNPL history (mock - would query actual history)
        const bnplHistory = this.scoringEngine.calculateBNPLHistory(0, 0, 0); // New customer

        // Device price ratio (mock - would need income data)
        const estimatedIncome = 100000; // Mock monthly income
        const devicePriceRatio = this.scoringEngine.calculateDevicePriceRatio(dto.requestedProduct.price, estimatedIncome);

        // Merchant risk profile (mock - would query merchant stats)
        const merchantRiskProfile = this.scoringEngine.calculateMerchantRiskProfile(0.05, 500);

        return {
            identityConfidence,
            phoneStability,
            bnplHistory,
            devicePriceRatio,
            merchantRiskProfile,
        };
    }

    /**
     * Get merchant policy
     */
    private async getMerchantPolicy(merchantId: string): Promise<any> {
        // Mock merchant policy - would query from database
        return {
            maxDeviceValue: 1000000,
            allowedTenures: [3, 6, 9, 12],
            minDownPaymentPercent: 0.20,
            riskTolerance: 'MEDIUM',
        };
    }

    /**
     * Apply merchant policy to scoring result
     */
    private applyMerchantPolicy(scoringResult: any, merchantPolicy: any): any {
        return {
            ...scoringResult,
            maxDeviceValue: Math.min(scoringResult.maxDeviceValue, merchantPolicy.maxDeviceValue),
            allowedTenure: scoringResult.allowedTenure.filter((t: number) => merchantPolicy.allowedTenures.includes(t)),
            minDownPayment: Math.max(scoringResult.minDownPayment, merchantPolicy.minDownPaymentPercent),
        };
    }

    /**
     * Log credit check for audit
     */
    private async logCreditCheck(checkId: string, dto: EligibilityCheckDto, decision: any, score: number): Promise<void> {
        try {
            await this.prisma.creditCheck.create({
                data: {
                    checkId,
                    merchantId: dto.merchantId,
                    agentId: dto.agentId,
                    phoneNumber: dto.customer.phoneNumber,
                    nin: dto.customer.nin,
                    requestedPrice: dto.requestedProduct.price,
                    decision: decision.decision,
                    score,
                    maxDeviceValue: decision.maxDeviceValue,
                    createdAt: new Date(),
                },
            });
        } catch (error) {
            this.logger.error(`Failed to log credit check: ${error.message}`);
        }
    }

    /**
     * Create rejection response
     */
    private createRejection(checkId: string, reasonCode: string, message: string): CreditDecisionDto {
        return {
            status: 'REJECTED',
            decision: {
                approved: false,
                reasonCode,
                message,
            },
            checkId,
        };
    }
}
