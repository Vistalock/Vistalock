import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class EligibilityCheckDto {
    @IsString()
    @IsNotEmpty()
    merchantId: string;

    @IsString()
    @IsNotEmpty()
    agentId: string;

    @IsNotEmpty()
    customer: {
        fullName: string;
        phoneNumber: string;
        nin: string;
        bvn?: string;
        dateOfBirth: string;
    };

    @IsNotEmpty()
    requestedProduct: {
        productId: string;
        category: string;
        price: number;
    };
}

export class CreditDecisionDto {
    status: 'APPROVED' | 'APPROVED_WITH_LIMITS' | 'REJECTED';
    decision: {
        approved: boolean;
        maxDeviceValue?: number;
        allowedTenure?: number[];
        minDownPayment?: number;
        interestRate?: number;
        creditRating?: string;
        reasonCode?: string;
        message?: string;
    };
    checkId: string;
}
