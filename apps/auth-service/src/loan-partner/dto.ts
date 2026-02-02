import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoanPartnerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    slug: string; // e.g., 'carbon'

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    baseUrl?: string;

    @IsString()
    @IsOptional()
    apiKey?: string;

    @IsString()
    @IsOptional()
    webhookSecret?: string;

    @IsNumber()
    @IsOptional()
    minDownPaymentPct?: number;

    @IsNumber()
    @IsOptional()
    maxTenure?: number;
}


// LPIS: Loan Creation (From Partner -> VistaLock)
export class LpisCreateLoanDto {
    @IsString()
    @IsNotEmpty()
    merchantId: string;

    @IsString()
    @IsOptional()
    agentId?: string;

    @IsString()
    @IsNotEmpty()
    deviceImei: string; // Must be pre-registered or created on-fly

    @IsString()
    @IsNotEmpty()
    productId: string;

    // Customer Info (Minimal needed for binding)
    @IsString()
    @IsNotEmpty()
    customerPhone: string;

    @IsString()
    @IsOptional()
    customerNin?: string;

    // Financials
    @IsNumber()
    loanAmount: number;

    @IsNumber()
    downPayment: number;

    @IsNumber()
    tenure: number; // Months

    @IsNumber()
    monthlyRepayment: number;

    @IsOptional()
    repaymentSchedule?: any[]; // Array of due dates
}

// LPIS: Webhook Payload (From Partner -> VistaLock)
export class LpisWebhookDto {
    @IsString()
    @IsNotEmpty()
    event: 'PAYMENT_RECEIVED' | 'PAYMENT_MISSED' | 'LOAN_DEFAULTED' | 'LOAN_SETTLED';

    @IsString()
    @IsNotEmpty()
    loanId: string; // VistaLock Loan ID or Partner Reference? We need to decide. Usually Partner sends THEIR ID + Our ID.

    // Actually, webhooks often rely on metadata passed during creation. 
    // Let's assume we pass a `reference` to them, and they return it.

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsString()
    @IsOptional()
    timestamp?: string;

    @IsString()
    @IsOptional()
    partnerLoanId?: string;
}
