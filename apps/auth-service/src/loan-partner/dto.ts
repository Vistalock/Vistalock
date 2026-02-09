import { IsString, IsNotEmpty, IsNumber, IsEmail, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== MERCHANT LOAN PARTNER MANAGEMENT ====================

export class CreateLoanPartnerDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    slug: string; // e.g., 'quickcredit', 'fincra' - unique per merchant

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    // Contact Information
    @IsString()
    @IsOptional()
    contactName?: string;

    @IsEmail()
    @IsOptional()
    contactEmail?: string;

    @IsString()
    @IsOptional()
    contactPhone?: string;

    // Webhook Configuration
    @IsString()
    @IsOptional()
    webhookUrl?: string; // Loan partner's webhook URL

    // Configuration
    @IsNumber()
    @IsOptional()
    minDownPaymentPct?: number;

    @IsNumber()
    @IsOptional()
    maxTenure?: number;
}

export class UpdateLoanPartnerDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    contactName?: string;

    @IsEmail()
    @IsOptional()
    contactEmail?: string;

    @IsString()
    @IsOptional()
    contactPhone?: string;

    @IsString()
    @IsOptional()
    webhookUrl?: string;

    @IsString()
    @IsOptional()
    status?: 'ACTIVE' | 'INACTIVE';

    @IsNumber()
    @IsOptional()
    minDownPaymentPct?: number;

    @IsNumber()
    @IsOptional()
    maxTenure?: number;
}

// ==================== EXTERNAL LOAN PARTNER API ====================

// Loan partner authentication
export class LoanPartnerLoginDto {
    @IsString()
    @IsNotEmpty()
    apiKey: string;

    @IsString()
    @IsNotEmpty()
    apiSecret: string;
}

// Loan creation from partner
export class CreateLoanFromPartnerDto {
    @IsString()
    @IsNotEmpty()
    deviceImei: string;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    customerPhone: string;

    @IsString()
    @IsOptional()
    customerNin?: string;

    @IsNumber()
    loanAmount: number;

    @IsNumber()
    downPayment: number;

    @IsNumber()
    tenure: number; // Months

    @IsNumber()
    monthlyRepayment: number;

    @IsNumber()
    @IsOptional()
    interestRate?: number;

    @IsOptional()
    repaymentSchedule?: any[];

    @IsString()
    @IsOptional()
    partnerLoanId?: string; // Partner's internal loan ID
}

// Payment update from partner
export class PaymentUpdateDto {
    @IsString()
    @IsNotEmpty()
    loanId: string; // VistaLock loan ID

    @IsNumber()
    amountPaid: number;

    @IsString()
    paymentDate: string;

    @IsNumber()
    remainingBalance: number;

    @IsString()
    @IsOptional()
    status?: 'CURRENT' | 'OVERDUE' | 'PAID';

    @IsString()
    @IsOptional()
    partnerReference?: string;
}

// Overdue notification from partner
export class OverdueNotificationDto {
    @IsString()
    @IsNotEmpty()
    loanId: string;

    @IsNumber()
    daysOverdue: number;

    @IsString()
    actionRequired: 'LOCK_DEVICE' | 'SEND_REMINDER' | 'ESCALATE';

    @IsString()
    @IsOptional()
    notes?: string;
}

// Loan closure from partner
export class LoanClosureDto {
    @IsString()
    @IsNotEmpty()
    loanId: string;

    @IsString()
    closedAt: string;

    @IsString()
    @IsOptional()
    closureReason?: 'PAID_IN_FULL' | 'SETTLED' | 'WRITTEN_OFF';
}

// Dispute from partner
export class DisputeDto {
    @IsString()
    @IsNotEmpty()
    loanId: string;

    @IsString()
    @IsNotEmpty()
    disputeType: 'PAYMENT_DISCREPANCY' | 'DEVICE_ISSUE' | 'CUSTOMER_COMPLAINT' | 'OTHER';

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// ==================== LEGACY (Deprecated) ====================

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
    deviceImei: string;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    customerPhone: string;

    @IsString()
    @IsOptional()
    customerNin?: string;

    @IsNumber()
    loanAmount: number;

    @IsNumber()
    downPayment: number;

    @IsNumber()
    tenure: number;

    @IsNumber()
    monthlyRepayment: number;

    @IsNumber()
    @IsOptional()
    interestRate?: number;

    @IsOptional()
    repaymentSchedule?: any[];
}

// LPIS: Webhook Payload (From Partner -> VistaLock)
export class LpisWebhookDto {
    @IsString()
    @IsNotEmpty()
    event: 'PAYMENT_RECEIVED' | 'PAYMENT_MISSED' | 'LOAN_DEFAULTED' | 'LOAN_SETTLED';

    @IsString()
    @IsNotEmpty()
    loanId: string;

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
