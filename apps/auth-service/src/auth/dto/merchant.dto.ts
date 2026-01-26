import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum BusinessType {
    SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
    LIMITED_LIABILITY = 'LIMITED_LIABILITY',
    ENTERPRISE = 'ENTERPRISE'
}

export class CreateMerchantProfileDto {
    @IsString()
    userId: string;

    @IsString()
    businessName: string;

    @IsEnum(BusinessType)
    businessType: BusinessType;

    @IsString()
    rcNumber: string;

    @IsString()
    businessAddress: string;

    @IsString()
    directorName: string;

    @IsString()
    directorPhone: string;
}

export class UpdateMerchantProfileDto {
    @IsOptional()
    @IsString()
    operatingAddress?: string;

    @IsOptional()
    @IsDateString()
    dateOfIncorporation?: string;

    @IsOptional()
    @IsString()
    directorNin?: string;

    @IsOptional()
    @IsString()
    bankName?: string;

    @IsOptional()
    @IsString()
    accountNumber?: string;

    @IsOptional()
    @IsString()
    accountName?: string;

    @IsOptional()
    @IsBoolean()
    agreementsSigned?: boolean;

    @IsOptional()
    documents?: any; // JSON object handling
}
