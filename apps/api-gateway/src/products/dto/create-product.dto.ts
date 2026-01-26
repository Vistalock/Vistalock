import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    brand: string;

    @IsString()
    model: string;

    @IsEnum(['Android', 'iOS'])
    osType: 'Android' | 'iOS';

    @IsNumber()
    @Min(0)
    retailPrice: number;

    @IsBoolean()
    @IsOptional()
    bnplEligible?: boolean;

    @IsNumber()
    @Min(1)
    @Max(12)
    @IsOptional()
    maxTenureMonths?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    downPayment?: number;

    @IsBoolean()
    @IsOptional()
    lockSupport?: boolean;

    @IsEnum(['active', 'inactive'])
    @IsOptional()
    status?: 'active' | 'inactive';

    @IsString()
    @IsOptional()
    branchId?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    stockQuantity?: number;
}
