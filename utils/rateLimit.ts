/**
 * Rate limiting middleware for Next.js API routes
 * Can be used with Upstash Redis or local in-memory store
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

interface RateLimitStore {
  get(key: string): Promise<number | undefined>;
  set(key: string, value: number, ttlMs: number): Promise<void>;
  increment(key: string, ttlMs: number): Promise<number>;
}

/**
 * Simple in-memory rate limit store
 * Note: This is not suitable for distributed systems - use Redis for production
 */
class InMemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string): Promise<number | undefined> {
    const entry = this.store.get(key);
    
    if (!entry) return undefined;
    
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    
    return entry.count;
  }

  async set(key: string, value: number, ttlMs: number): Promise<void> {
    this.store.set(key, {
      count: value,
      resetTime: Date.now() + ttlMs,
    });
  }

  async increment(key: string, ttlMs: number): Promise<number> {
    const entry = this.store.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      await this.set(key, 1, ttlMs);
      return 1;
    }
    
    entry.count++;
    return entry.count;
  }
}

/**
 * Creates a rate limiting middleware
 */
export function createRateLimiter(
  config: RateLimitConfig,
  store: RateLimitStore = new InMemoryStore()
) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip ?? "unknown",
  } = config;

  return async (
    req: any,
    res: any
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> => {
    const key = keyGenerator(req);
    const count = await store.increment(key, windowMs);

    const allowed = count <= maxRequests;
    const remaining = Math.max(0, maxRequests - count);
    const resetTime = new Date(Date.now() + windowMs);

    // Set rate limit headers
    if (res && typeof res.setHeader === "function") {
      res.setHeader("X-RateLimit-Limit", maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", Math.floor(resetTime.getTime() / 1000).toString());
    }

    return { allowed, remaining, resetTime };
  };
}

/**
 * Pre-configured rate limiters for common scenarios
 */
export const RATE_LIMITS = {
  // Strict limit for auth endpoints (login, register, password reset)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },

  // Moderate limit for API endpoints
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },

  // Loose limit for general endpoints
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },

  // Very strict for sensitive operations (delete account)
  DELETE_ACCOUNT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },

  // Strict for file uploads
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
  },
};

/**
 * Example usage in a Next.js API route
 */
export function withRateLimit(
  handler: (req: any, res: any) => Promise<any>,
  config: RateLimitConfig
) {
  const limiter = createRateLimiter(config);

  return async (req: any, res: any) => {
    const { allowed, remaining, resetTime } = await limiter(req, res);

    if (!allowed) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
      });
    }

    return handler(req, res);
  };
}

/**
 * Middleware for catching and logging rate limit violations
 */
export async function trackRateLimitViolations(
  req: any,
  limiter: ReturnType<typeof createRateLimiter>
) {
  const result = await limiter(req, undefined);

  if (!result.allowed) {
    console.warn(
      `Rate limit exceeded for ${req.ip} - limit: ${RATE_LIMITS.API.maxRequests}, window: ${RATE_LIMITS.API.windowMs}ms`
    );
  }

  return result;
}
