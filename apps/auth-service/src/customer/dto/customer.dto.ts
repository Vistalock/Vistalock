import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class SendOtpDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}

export class VerifyIdDto {
    @IsEnum(['BVN', 'NIN'])
    type: 'BVN' | 'NIN';

    @IsString()
    @IsNotEmpty()
    value: string;
}
