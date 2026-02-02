import { Redis } from '@upstash/redis';

export class CacheService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            url: process.env.UPSTASH_REDIS_URL || '',
            token: process.env.UPSTASH_REDIS_TOKEN || '',
        });
    }

    /**
     * Get cached value or fetch and cache if not exists
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number = 300
    ): Promise<T> {
        try {
            // Try to get from cache
            const cached = await this.redis.get(key);

            if (cached) {
                console.log(`✅ Cache HIT: ${key}`);
                return cached as T;
            }

            console.log(`❌ Cache MISS: ${key}`);

            // Fetch fresh data
            const fresh = await fetcher();

            // Store in cache
            await this.redis.setex(key, ttlSeconds, JSON.stringify(fresh));

            return fresh;
        } catch (error) {
            console.error('Cache error:', error);
            // Fallback to fetcher if cache fails
            return fetcher();
        }
    }

    /**
     * Invalidate cache by key or pattern
     */
    async invalidate(keyOrPattern: string): Promise<void> {
        try {
            if (keyOrPattern.includes('*')) {
                // Pattern-based deletion
                const keys = await this.redis.keys(keyOrPattern);
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                    console.log(`🗑️ Invalidated ${keys.length} keys matching: ${keyOrPattern}`);
                }
            } else {
                // Single key deletion
                await this.redis.del(keyOrPattern);
                console.log(`🗑️ Invalidated: ${keyOrPattern}`);
            }
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }

    /**
     * Set value with TTL
     */
    async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
        try {
            await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Get value
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            return value as T | null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Delete value
     */
    async delete(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    /**
     * Check if Redis is connected
     */
    async ping(): Promise<boolean> {
        try {
            const result = await this.redis.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('Redis ping failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const cacheService = new CacheService();
