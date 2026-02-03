import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
    private requests = new Map<string, number[]>();

    use(req: Request, res: Response, next: NextFunction) {
        const key = `${req.ip}-${req.path}`;
        const now = Date.now();
        const windowMs = 60000; // 1 minute window
        const maxRequests = 3; // Max 3 submissions per minute per IP

        // Get existing timestamps for this key
        const timestamps = this.requests.get(key) || [];

        // Filter out timestamps outside the current window
        const recentRequests = timestamps.filter(timestamp => now - timestamp < windowMs);

        // Check if limit exceeded
        if (recentRequests.length >= maxRequests) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests. Please wait before submitting again.',
                    retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000) // seconds
                },
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        // Add current timestamp
        recentRequests.push(now);
        this.requests.set(key, recentRequests);

        // Cleanup old entries periodically (every 5 minutes)
        if (Math.random() < 0.01) {
            this.cleanup(now, windowMs);
        }

        next();
    }

    private cleanup(now: number, windowMs: number) {
        for (const [key, timestamps] of this.requests.entries()) {
            const recentRequests = timestamps.filter(t => now - t < windowMs);
            if (recentRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, recentRequests);
            }
        }
    }
}
