import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoanPartnerService } from './loan-partner.service';

@Injectable()
export class LoanPartnerStrategy extends PassportStrategy(Strategy, 'loan-partner') {
    constructor(private loanPartnerService: LoanPartnerService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'secretKey', // TODO: Use env vars properly
        });
    }

    async validate(payload: any) {
        if (payload.role !== 'LOAN_PARTNER') {
            throw new UnauthorizedException('Invalid token role');
        }

        // Return properties that we want to access in @Request() req.user
        return {
            partnerId: payload.sub,
            merchantId: payload.merchantId,
            role: payload.role
        };
    }
}
