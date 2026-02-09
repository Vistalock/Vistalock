import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

// ==================== WALLET MANAGEMENT ====================

export class TopUpWalletDto {
    @IsNumber()
    @Min(100)
    amount: number; // Minimum ₦100

    @IsString()
    @IsOptional()
    paymentMethod?: 'PAYSTACK' | 'BANK_TRANSFER' | 'MANUAL';

    @IsString()
    @IsOptional()
    reference?: string; // Payment reference
}

export class WalletTransactionQueryDto {
    @IsNumber()
    @IsOptional()
    page?: number;

    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    type?: 'CREDIT' | 'DEBIT';

    @IsString()
    @IsOptional()
    startDate?: string;

    @IsString()
    @IsOptional()
    endDate?: string;
}

// ==================== ENROLLMENT BILLING ====================

export class EnrollmentBillingQueryDto {
    @IsNumber()
    @IsOptional()
    page?: number;

    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    status?: 'PENDING' | 'PAID' | 'REVERSED';

    @IsString()
    @IsOptional()
    startDate?: string;

    @IsString()
    @IsOptional()
    endDate?: string;
}

export class UsageStatsQueryDto {
    @IsNumber()
    @IsOptional()
    month?: number; // 1-12

    @IsNumber()
    @IsOptional()
    year?: number; // e.g., 2026
}

// ==================== ADMIN BILLING ====================

export class BillingOverviewQueryDto {
    @IsString()
    @IsOptional()
    startDate?: string;

    @IsString()
    @IsOptional()
    endDate?: string;
}

export class MerchantBillingQueryDto {
    @IsNumber()
    @IsOptional()
    page?: number;

    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    search?: string; // Search by merchant name/email
}

export class ProcessRefundDto {
    @IsString()
    @IsNotEmpty()
    billingId: string;

    @IsString()
    @IsNotEmpty()
    reason: string;
}

export class AdjustWalletDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number; // Can be positive or negative

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsOptional()
    reference?: string;
}

// ==================== PRICING TIER MANAGEMENT ====================

export class CreatePricingTierDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    minVolume: number;

    @IsNumber()
    @IsOptional()
    maxVolume?: number;

    @IsNumber()
    @Min(0)
    pricePerDevice: number;

    @IsString()
    @IsOptional()
    currency?: string;
}

export class UpdatePricingTierDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    minVolume?: number;

    @IsNumber()
    @IsOptional()
    maxVolume?: number;

    @IsNumber()
    @IsOptional()
    pricePerDevice?: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsOptional()
    isActive?: boolean;
}
