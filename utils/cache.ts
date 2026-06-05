/**
 * Simple in-memory cache utility for dashboard statistics
 * Note: For production with multiple instances, consider using Redis
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Generates a cache key from userId and optional parameters
 */
export function generateCacheKey(
  prefix: string,
  userId: string,
  suffix?: string
): string {
  return `${prefix}:${userId}${suffix ? `:${suffix}` : ""}`;
}

/**
 * Gets a value from cache if it exists and hasn't expired
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if cache entry has expired
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Sets a value in cache with a time-to-live (TTL) in milliseconds
 */
export function setInCache<T>(
  key: string,
  data: T,
  ttlMs: number = 5 * 60 * 1000 // Default: 5 minutes
): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

/**
 * Clears a specific cache entry
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * Clears all cache entries for a user
 */
export function clearUserCache(userId: string): void {
  const keysToDelete: string[] = [];

  for (const key of cache.keys()) {
    if (key.includes(userId)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.delete(key));
}

/**
 * Clears all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Cache wrapper for async operations with automatic expiration
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000 // Default: 5 minutes
): Promise<T> {
  // Try to get from cache first
  const cached = getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  setInCache(key, data, ttlMs);

  return data;
}

/**
 * Cache keys for dashboard queries
 */
export const CACHE_KEYS = {
  DASHBOARD_STATS: "dashboard:stats",
  DASHBOARD_RECENT: "dashboard:recent",
  DASHBOARD_CONFIG: "dashboard:config",
  USER_PROFILE: "profile",
  FOLDER: "folder",
  TEAM: "team",
};

/**
 * Cache TTLs - different data types have different expiration times
 */
export const CACHE_TTL = {
  STATS: 10 * 60 * 1000, // Stats: 10 minutes (not frequently changing)
  RECENT_ITEMS: 3 * 60 * 1000, // Recent items: 3 minutes (more dynamic)
  PROFILE: 30 * 60 * 1000, // Profile: 30 minutes (stable)
  FOLDER: 5 * 60 * 1000, // Folders: 5 minutes
};
