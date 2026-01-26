import { IsString, IsEmail, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    deviceId?: string;
}

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(12, { message: 'Password must be at least 12 characters long' })
    @Matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, { message: 'Password can contain letters, numbers, and symbols' })
    password: string;

    @IsOptional()
    @IsString()
    role?: string;
}
