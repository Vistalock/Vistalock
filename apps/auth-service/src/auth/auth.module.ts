import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { SudoGuard } from './sudo.guard';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';

@Module({
    imports: [
        UsersModule,
        AdminAuditModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secretKey',
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, JwtStrategy, SudoGuard],
    controllers: [AuthController],
    exports: [AuthService, JwtModule, SudoGuard],
})
export class AuthModule { }
