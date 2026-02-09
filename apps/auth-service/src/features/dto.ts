import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

// ==================== FEATURE CATALOG ====================

export class CreateFeatureDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['SECURITY', 'ANALYTICS', 'INTEGRATION', 'SUPPORT'])
    category: 'SECURITY' | 'ANALYTICS' | 'INTEGRATION' | 'SUPPORT';

    @IsString()
    @IsNotEmpty()
    @IsEnum(['PER_DEVICE', 'FLAT_MONTHLY', 'ONE_TIME'])
    pricingType: 'PER_DEVICE' | 'FLAT_MONTHLY' | 'ONE_TIME';

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    metadata?: any;
}

export class UpdateFeatureDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    category?: 'SECURITY' | 'ANALYTICS' | 'INTEGRATION' | 'SUPPORT';

    @IsString()
    @IsOptional()
    pricingType?: 'PER_DEVICE' | 'FLAT_MONTHLY' | 'ONE_TIME';

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    metadata?: any;
}

// ==================== FEATURE SUBSCRIPTIONS ====================

export class SubscribeToFeatureDto {
    @IsString()
    @IsNotEmpty()
    featureId: string;
}

export class FeatureSubscriptionQueryDto {
    @IsString()
    @IsOptional()
    status?: 'ACTIVE' | 'CANCELLED';

    @IsNumber()
    @IsOptional()
    page?: number;

    @IsNumber()
    @IsOptional()
    limit?: number;
}

// ==================== FEATURE REQUESTS ====================

export class CreateFeatureRequestDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    useCase?: string;

    @IsNumber()
    @IsOptional()
    budget?: number;
}

export class UpdateFeatureRequestDto {
    @IsString()
    @IsOptional()
    @IsEnum(['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED', 'REJECTED'])
    status?: 'PENDING' | 'REVIEWING' | 'QUOTED' | 'APPROVED' | 'REJECTED';

    @IsString()
    @IsOptional()
    adminNotes?: string;

    @IsNumber()
    @IsOptional()
    quotedPrice?: number;
}

export class FeatureRequestQueryDto {
    @IsString()
    @IsOptional()
    status?: 'PENDING' | 'REVIEWING' | 'QUOTED' | 'APPROVED' | 'REJECTED';

    @IsNumber()
    @IsOptional()
    page?: number;

    @IsNumber()
    @IsOptional()
    limit?: number;
}
