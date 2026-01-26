import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterDeviceDto {
    @IsString()
    @IsNotEmpty()
    imei: string;

    @IsString()
    @IsOptional()
    serialNumber?: string;

    @IsString()
    @IsOptional()
    model?: string;

    @IsString()
    @IsNotEmpty()
    merchantId: string;
}
