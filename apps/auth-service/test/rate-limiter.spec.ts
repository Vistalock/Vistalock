import { RateLimiterMiddleware } from '../src/common/middleware/rate-limiter.middleware';
import { Request, Response, NextFunction } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('RateLimiterMiddleware', () => {
    let middleware: RateLimiterMiddleware;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        middleware = new RateLimiterMiddleware();
        req = { ip: '127.0.0.1', path: '/auth/merchant/apply' };
        res = {};
        next = jest.fn();
    });

    it('should allow requests within limit', () => {
        // 3 requests allowed
        middleware.use(req as Request, res as Response, next);
        middleware.use(req as Request, res as Response, next);
        middleware.use(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(3);
    });

    it('should block 4th request', () => {
        // 3 allowed
        middleware.use(req as Request, res as Response, next);
        middleware.use(req as Request, res as Response, next);
        middleware.use(req as Request, res as Response, next);

        // 4th should fail
        expect(() => {
            middleware.use(req as Request, res as Response, next);
        }).toThrow(HttpException);

        try {
            middleware.use(req as Request, res as Response, next);
        } catch (e) {
            expect(e.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }
    });

    it('should allow request after window expires', () => {
        // Mock Date.now
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);

        // 3 allowed
        middleware.use(req as Request, res as Response, next);
        middleware.use(req as Request, res as Response, next);
        middleware.use(req as Request, res as Response, next);

        // Advance time by 61 seconds
        jest.spyOn(Date, 'now').mockReturnValue(now + 61000);

        // Should allow again
        middleware.use(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(4);
    });

    it('should track limits per IP', () => {
        const req1 = { ip: '1.2.3.4', path: '/auth/merchant/apply' };
        const req2 = { ip: '5.6.7.8', path: '/auth/merchant/apply' };

        // Max out req1
        middleware.use(req1 as Request, res as Response, next);
        middleware.use(req1 as Request, res as Response, next);
        middleware.use(req1 as Request, res as Response, next);

        // req1 blocked
        expect(() => {
            middleware.use(req1 as Request, res as Response, next);
        }).toThrow();

        // req2 should be allowed
        middleware.use(req2 as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(4);
    });
});
