import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SudoGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const sudoToken = request.headers['x-sudo-token'];

        if (!sudoToken) {
            throw new UnauthorizedException('Sudo token required for this action');
        }

        try {
            const payload = this.jwtService.verify(sudoToken);
            if (payload.scope !== 'sudo') {
                throw new UnauthorizedException('Invalid sudo token scope');
            }
            // Optional: Check if payload.sub matches request.user.id (if strict binding is needed)
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired sudo token');
        }
    }
}
