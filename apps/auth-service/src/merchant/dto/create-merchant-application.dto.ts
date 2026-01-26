
import {
    IsString,
    IsEmail,
    IsOptional,
    IsDateString,
    ValidateNested,
    IsArray,
    Matches,
    IsUrl,
    Length,
    IsBoolean,
    IsNumberString
} from 'class-validator';
import { Type } from 'class-transformer';

// Regex for strict name validation (Alphanumeric, spaces, dots, dashes only)
const STRICT_NAME_REGEX = /^[a-zA-Z0-9\s\.\-']+$/;
// Regex for phone (Digits and + only)
const PHONE_REGEX = /^[0-9\+]+$/;

class DirectorDto {
    @IsString()
    @Matches(STRICT_NAME_REGEX, { message: 'Director name contains invalid characters' })
    name: string;

    @IsString()
    @IsOptional()
    dob?: string;

    @IsString()
    @IsOptional()
    nationality?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    idNumber?: string;

    @IsOptional()
    share?: string | number;
}

class SignatoryDto {
    @IsString()
    @Matches(STRICT_NAME_REGEX, { message: 'Signatory name contains invalid characters' })
    name: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsString()
    @IsOptional()
    contact?: string;

    @IsString()
    @IsOptional()
    idNumber?: string;
}

class BankDetailsDto {
    @IsString()
    @IsOptional()
    bankName?: string;

    @IsNumberString({}, { message: 'Account Number must be numeric' })
    @Length(10, 10, { message: 'Account Number must be 10 digits' })
    @IsOptional()
    accountNumber?: string;

    @IsString()
    @IsOptional()
    accountName?: string;

    @IsNumberString()
    @Length(11, 11, { message: 'BVN must be 11 digits' })
    @IsOptional()
    bvn?: string;

    @IsString()
    @IsOptional()
    settlementCycle?: string;
}

class OperationsDto {
    @IsOptional()
    yearsInOp?: string | number;

    @IsOptional()
    outlets?: string | number;

    @IsOptional()
    monthlyVolume?: string;
}

class DeviceDetailsDto {
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    types?: string[];

    @IsString()
    @IsOptional()
    source?: string;
}

class AgentDetailsDto {
    @IsOptional()
    expectedCount?: string | number;

    @IsString()
    @IsOptional()
    location?: string;
}

class ComplianceDto {
    @IsBoolean()
    @IsOptional()
    dataProcessing?: boolean;

    @IsBoolean()
    @IsOptional()
    lockingPolicy?: boolean;

    @IsBoolean()
    @IsOptional()
    revenueShare?: boolean;
}

export class CreateMerchantApplicationDto {
    // 1. Business Info
    @IsString()
    @Matches(STRICT_NAME_REGEX, { message: 'Business Name contains invalid symbols' })
    businessName: string;

    @IsString()
    @IsOptional()
    @Matches(STRICT_NAME_REGEX, { message: 'Trading Name contains invalid symbols' })
    tradingName?: string;

    @IsString()
    @IsOptional()
    businessType?: string;

    @IsString()
    @IsOptional()
    cacNumber?: string;

    @IsString()
    @IsOptional()
    dateOfIncorporation?: string;

    @IsString()
    @IsOptional()
    natureOfBusiness?: string;

    @IsString()
    @IsOptional()
    website?: string;

    // 2. Contact & Address
    @IsString()
    @Matches(STRICT_NAME_REGEX, { message: 'Contact Name contains invalid symbols' })
    contactName: string;

    @IsEmail({}, { message: 'Invalid Email Address' })
    email: string;

    @IsNumberString({}, { message: 'Phone number must be numeric' })
    @Length(11, 11, { message: 'Phone number must be exactly 11 digits' })
    phone: string;

    @IsString()
    businessAddress: string;

    @IsString()
    @IsOptional()
    operatingAddress?: string;

    // 3. Nested Data
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DirectorDto)
    @IsOptional()
    directors?: DirectorDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SignatoryDto)
    @IsOptional()
    signatories?: SignatoryDto[];

    @ValidateNested()
    @Type(() => BankDetailsDto)
    @IsOptional()
    bankDetails?: BankDetailsDto;

    @ValidateNested()
    @Type(() => OperationsDto)
    @IsOptional()
    operations?: OperationsDto;

    @ValidateNested()
    @Type(() => DeviceDetailsDto)
    @IsOptional()
    deviceDetails?: DeviceDetailsDto;

    @ValidateNested()
    @Type(() => AgentDetailsDto)
    @IsOptional()
    agentDetails?: AgentDetailsDto;

    @ValidateNested()
    @Type(() => ComplianceDto)
    @IsOptional()
    compliance?: ComplianceDto;

    @IsOptional()
    documents?: any; // Keep loose for now as it might be complex URL maps
}
