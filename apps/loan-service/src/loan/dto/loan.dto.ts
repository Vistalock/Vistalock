import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateLoanDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    deviceId: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsNumber()
    @Min(0)
    interestRate: number;

    @IsNumber()
    @Min(1)
    @Max(24) // Assuming 24 months limit for now
    durationMonths: number;
}
