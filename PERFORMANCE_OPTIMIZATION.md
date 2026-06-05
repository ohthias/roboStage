# Performance Optimization Guide for RoboStage

## Overview

This document provides recommendations for further performance improvements to the RoboStage database and application layer.

## Database Optimization

### Recommended Indexes

Create these indexes in Supabase to significantly improve query performance:

```sql
-- User lookups
CREATE INDEX idx_profiles_user_id ON profiles(id);
CREATE INDEX idx_user_tags_user_id ON user_tags(user_id);
CREATE INDEX idx_user_followers_user_id ON user_followers(user_id);

-- Team operations
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_spaces_join_code ON team_spaces(join_code);

-- Document queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_team_id ON documents(team_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);

-- Test tracking
CREATE INDEX idx_tests_user_id ON tests(user_id);
CREATE INDEX idx_tests_team_id ON tests(team_id);
CREATE INDEX idx_tests_folder_id ON tests(folder_id);
CREATE INDEX idx_tests_last_acess ON tests(last_acess DESC);

-- Folder hierarchy
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_owner_id ON folders(owner_id);
CREATE INDEX idx_folders_team_id ON folders(team_id);
CREATE INDEX idx_folders_is_deleted ON folders(is_deleted);

-- Event operations
CREATE INDEX idx_events_responsavel ON events(id_responsavel);
CREATE INDEX idx_events_code_event ON events(code_event);
CREATE INDEX idx_events_last_acess ON events(last_acess DESC);

-- Style management
CREATE INDEX idx_styleLab_user_id ON styleLab(id_user);

-- Compound indexes for common queries
CREATE INDEX idx_documents_user_updated ON documents(user_id, updated_at DESC);
CREATE INDEX idx_tests_user_last ON tests(user_id, last_acess DESC);
CREATE INDEX idx_folders_owner_deleted ON folders(owner_id, is_deleted);
```

### Query Optimization Tips

1. **Pagination**: Always use limit and offset for large result sets
   ```typescript
   // Good
   .limit(50).range(0, 49)
   
   // Bad - loads all records
   .select("*")
   ```

2. **Column Selection**: Select only needed columns
   ```typescript
   // Good - reduces payload
   .select("id, name, created_at")
   
   // Bad - includes all columns
   .select("*")
   ```

3. **Filter Early**: Apply filters before ordering
   ```typescript
   // Good
   .eq("user_id", userId)
   .eq("is_deleted", false)
   .order("updated_at", { ascending: false })
   
   // Less efficient - orders before filtering
   .order("updated_at", { ascending: false })
   .eq("is_deleted", false)
   ```

## Caching Strategy

### Current Implementation

The application now includes a caching layer for dashboard statistics:

- **Dashboard Stats**: 10 minute TTL (counts don't change frequently)
- **Recent Items**: 3 minute TTL (more dynamic data)
- **User Profile**: 30 minute TTL (relatively stable)
- **Folders**: 5 minute TTL (medium volatility)

### Invalidation

Clear cache when data changes:

```typescript
import { clearUserCache } from "@/utils/cache"

// After creating a document
clearUserCache(userId)

// Or clear specific cache entry
import { clearCache } from "@/utils/cache"
clearCache(cacheKey)
```

### For Production Multi-Instance Setup

Replace the in-memory cache with Redis:

```typescript
// utils/cache-redis.ts
import redis from "redis"

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
})

export async function getFromCache<T>(key: string): Promise<T | null> {
  const data = await client.get(key)
  return data ? JSON.parse(data) : null
}

export async function setInCache<T>(
  key: string,
  data: T,
  ttlMs: number = 5 * 60 * 1000
): Promise<void> {
  await client.setex(key, Math.floor(ttlMs / 1000), JSON.stringify(data))
}
```

## Frontend Performance

### Skeleton Loading States

Implement skeleton screens while loading dashboard data:

```tsx
// Example
function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show skeleton immediately
    setIsLoading(true)
    
    // Load stats
    dashboardService.getStats(userId).then(data => {
      setStats(data)
      setIsLoading(false)
    })
  }, [userId])

  if (isLoading) return <StatsSkeleton />
  return <Dashboard stats={stats} />
}
```

### Request Debouncing

For frequently triggered queries:

```typescript
import { debounce } from "@/utils/debounce"

const debouncedSearch = debounce((query: string) => {
  searchDocuments(query)
}, 300) // Wait 300ms after typing stops
```

## Batch Operations

For bulk operations, use batch requests instead of multiple individual calls:

```typescript
// Instead of:
for (const folderId of folderIds) {
  await deleteFolder(folderId)
}

// Better: Create a batch delete function
async function deleteFolders(folderIds: number[]) {
  return await supabase
    .from("folders")
    .delete()
    .in("id", folderIds)
}
```

## Monitoring & Analytics

### Recommended Metrics to Track

1. **Dashboard Load Time**: Time from request to data ready
2. **Cache Hit Rate**: Percentage of queries served from cache
3. **Database Query Duration**: Average query execution time
4. **API Response Time**: Full round-trip time
5. **Error Rate**: Percentage of failed requests

### Example Monitoring Implementation

```typescript
// utils/monitoring.ts
export async function trackQueryPerformance(
  operationName: string,
  operation: () => Promise<any>
) {
  const startTime = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - startTime
    
    console.log(`${operationName} completed in ${duration}ms`)
    
    // Send to analytics service
    if (duration > 1000) {
      console.warn(`${operationName} is slow: ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`${operationName} failed after ${duration}ms`, error)
    throw error
  }
}
```

## Rate Limiting Recommendations

Implement rate limiting to prevent abuse:

```typescript
// middleware/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
})

export async function middleware(req: NextRequest) {
  const identifier = req.ip ?? "unknown"
  
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    )
  }
}
```

## Row-Level Security (RLS)

Implement RLS policies for production:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can see own profile" ON profiles
  FOR SELECT USING (auth.uid() = id)

-- Users can only modify their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)

-- Users can see documents they own or have access to
CREATE POLICY "Users can see their documents" ON documents
  FOR SELECT USING (auth.uid() = user_id)
```

## Next Steps

1. **Implement database indexes** (High Priority)
2. **Enable RLS policies** (High Priority)
3. **Set up monitoring** (Medium Priority)
4. **Implement rate limiting** (Medium Priority)
5. **Migrate to Redis for caching** when scaling to multiple instances (Low Priority)

## References

- [Supabase Performance Tips](https://supabase.com/docs/guides/performance-optimization)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Redis Caching](https://redis.io/)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
