import Redis from 'ioredis';

export class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.max = options.max || 100; // limit each IP to 100 requests per windowMs
    this.useRedis = process.env.USE_REDIS === 'true';
    this.inMemoryStore = new Map(); // Fallback in-memory store
    
    if (this.useRedis) {
      try {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          retryStrategy: (times) => {
            // Only retry 3 times, then fall back to in-memory
            if (times > 3) {
              console.warn('Redis connection failed after 3 attempts, falling back to in-memory rate limiting');
              this.useRedis = false;
              return null; // Stop retrying
            }
            return Math.min(times * 1000, 3000); // Exponential backoff
          },
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false
        });
        
        this.redis.on('error', (err) => {
          console.error('Redis error:', err.message);
          // Don't flood the console with repeated errors
          if (!this.redisErrorLogged) {
            console.warn('Falling back to in-memory rate limiting due to Redis error');
            this.redisErrorLogged = true;
            this.useRedis = false;
          }
        });
      } catch (error) {
        console.error('Failed to initialize Redis:', error.message);
        this.useRedis = false;
      }
    }
  }

  async checkLimit(userId) {
    const key = `ratelimit:${userId}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Use Redis if available, otherwise use in-memory store
    if (this.useRedis && this.redis) {
      try {
        // Clean old records
        await this.redis.zremrangebyscore(key, 0, windowStart);

        // Count requests in current window
        const requestCount = await this.redis.zcard(key);

        if (requestCount >= this.max) {
          return {
            allowed: false,
            remaining: 0,
            reset: windowStart + this.windowMs
          };
        }

        // Add new request
        await this.redis.zadd(key, now, `${now}-${Math.random()}`);
        await this.redis.expire(key, Math.ceil(this.windowMs / 1000));

        return {
          allowed: true,
          remaining: this.max - requestCount - 1,
          reset: windowStart + this.windowMs
        };
      } catch (error) {
        // If Redis fails, fall back to in-memory
        console.error('Rate limiter Redis error:', error.message);
        this.useRedis = false;
        // Continue to in-memory implementation
      }
    }

    // In-memory implementation
    if (!this.inMemoryStore.has(key)) {
      this.inMemoryStore.set(key, []);
    }

    const requests = this.inMemoryStore.get(key);
    
    // Clean old records
    const validRequests = requests.filter(time => time > windowStart);
    this.inMemoryStore.set(key, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= this.max) {
      return {
        allowed: false,
        remaining: 0,
        reset: windowStart + this.windowMs
      };
    }

    // Add new request
    validRequests.push(now);
    this.inMemoryStore.set(key, validRequests);

    // Set expiration for the key
    setTimeout(() => {
      this.inMemoryStore.delete(key);
    }, this.windowMs);

    return {
      allowed: true,
      remaining: this.max - validRequests.length,
      reset: windowStart + this.windowMs
    };
  }
} 