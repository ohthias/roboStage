# Implementation Guide: Performance and Security Improvements

This guide explains how to use the new utilities and best practices introduced in the performance and security improvements.

## Quick Start

### 1. Input Validation

Always validate user inputs before database operations:

```typescript
import { validateEmail, validateUUID, validateNonEmptyString } from "@/utils/validation"

// In your repository
export const userRepository = {
  async getUser(userId: string) {
    const validId = validateUUID(userId, "userId") // Throws if invalid
    
    return supabase
      .from("profiles")
      .select("id, name, email")
      .eq("id", validId)
      .single()
  }
}
```

### 2. Error Handling

Use standardized error handling for consistent API responses:

```typescript
import { ApiError, ErrorCode } from "@/utils/errorHandling"

export async function deleteUser(userId: string) {
  try {
    const validId = validateUUID(userId, "userId")
    
    // Your deletion logic
    await supabase.from("profiles").delete().eq("id", validId)
    
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ApiError(error.message, 400, ErrorCode.VALIDATION_ERROR)
    }
    throw new ApiError("Failed to delete user", 500, ErrorCode.DATABASE_ERROR)
  }
}
```

### 3. Caching

Cache frequently accessed data to reduce database load:

```typescript
import { withCache, generateCacheKey, CACHE_KEYS, CACHE_TTL } from "@/utils/cache"

export const userService = {
  async getUserProfile(userId: string) {
    const cacheKey = generateCacheKey(CACHE_KEYS.USER_PROFILE, userId)
    
    return withCache(
      cacheKey,
      async () => {
        return await userRepository.getProfile(userId)
      },
      CACHE_TTL.PROFILE
    )
  }
}
```

### 4. Rate Limiting

Protect API endpoints from abuse:

```typescript
import { withRateLimit, RATE_LIMITS } from "@/utils/rateLimit"

export async function POST(req: NextRequest) {
  // Apply rate limiting to auth endpoint
  return withRateLimit(
    async (req, res) => {
      // Your auth logic
    },
    RATE_LIMITS.AUTH
  )(req, new NextResponse())
}
```

### 5. Performance Monitoring

Track operation performance:

```typescript
import { trackOperation } from "@/utils/monitoring"

export async function fetchUserData(userId: string) {
  return trackOperation(
    "fetchUserData",
    async () => {
      return await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
    },
    { userId } // Metadata
  )
}

// Later, get metrics
import { getMetrics, printMetricsSummary } from "@/utils/monitoring"

// Print performance summary
printMetricsSummary()

// Get detailed metrics
const metrics = getMetrics()
console.log(`Average operation time: ${metrics.avgDuration}ms`)
```

### 6. Frontend Performance

Use debouncing for user input:

```typescript
import { debounce } from "@/utils/performance"

function SearchComponent() {
  const [results, setResults] = useState([])
  
  const handleSearch = debounce((query: string) => {
    // This won't be called until 300ms after user stops typing
    searchDocuments(query).then(setResults)
  }, 300)
  
  return (
    <input onChange={(e) => handleSearch(e.target.value)} />
  )
}
```

## Validation Examples

### Email Validation

```typescript
import { validateEmail } from "@/utils/validation"

try {
  const email = validateEmail("user@example.com")
  // email is now validated and lowercased
} catch (error) {
  console.error(error.message) // "email must be a valid email address"
}
```

### UUID Validation

```typescript
import { validateUUID } from "@/utils/validation"

try {
  const userId = validateUUID("550e8400-e29b-41d4-a716-446655440000", "userId")
  // userId is valid UUID
} catch (error) {
  console.error("Invalid UUID format")
}
```

### Pagination Validation

```typescript
import { validatePaginationParams } from "@/utils/validation"

const { limit, offset } = validatePaginationParams(
  req.query.limit,
  req.query.offset,
  100 // max limit
)

// Returns: { limit: 10-100, offset: 0+ }
```

## Cache Management

### Clear Cache on Update

```typescript
import { clearUserCache } from "@/utils/cache"

export async function updateUser(userId: string, data: any) {
  // Update database
  const result = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId)
  
  // Clear associated caches
  clearUserCache(userId)
  
  return result
}
```

### Set Custom Cache TTL

```typescript
import { setInCache } from "@/utils/cache"

// Cache for 30 minutes
setInCache(
  "expensive-report:123",
  reportData,
  30 * 60 * 1000
)
```

## Database Indexes

After making these code changes, add indexes to your database for optimal performance:

```sql
-- Run in Supabase SQL editor

-- User queries
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON user_tags(user_id);

-- Document queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);

-- See PERFORMANCE_OPTIMIZATION.md for complete list
```

## Monitoring in Production

```typescript
// In your API route
import { trackOperation, exportMetrics } from "@/utils/monitoring"

export async function GET(req: NextRequest) {
  return trackOperation(
    "GET /api/dashboard",
    async () => {
      // Your dashboard logic
    }
  )
}

// Add a metrics endpoint
export async function GET_METRICS(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== process.env.METRICS_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  return NextResponse.json(exportMetrics())
}
```

## Security Best Practices

### 1. Always Validate Input

```typescript
// ❌ Bad
async function getUser(userId: string) {
  return supabase.from("profiles").select("*").eq("id", userId).single()
}

// ✓ Good
async function getUser(userId: string) {
  const validId = validateUUID(userId, "userId")
  return supabase
    .from("profiles")
    .select("id, name, email") // explicit columns
    .eq("id", validId)
    .single()
}
```

### 2. Use Explicit Column Selection

```typescript
// ❌ Bad - exposes all columns
.select("*")

// ✓ Good - only what's needed
.select("id, name, created_at")
```

### 3. Handle Errors Gracefully

```typescript
// ❌ Bad - exposes internal details
catch (error) {
  return res.status(500).json({ error: error.message })
}

// ✓ Good - sanitized error
catch (error) {
  console.error(error) // Log internally
  return res.status(500).json({ error: "An error occurred" })
}
```

### 4. Implement Rate Limiting

```typescript
// Protect sensitive endpoints
app.post("/api/login", withRateLimit(
  loginHandler,
  RATE_LIMITS.AUTH
))

// Protect bulk operations
app.delete("/api/bulk-delete", withRateLimit(
  bulkDeleteHandler,
  { windowMs: 60 * 60 * 1000, maxRequests: 10 }
))
```

## Performance Checklist

- [ ] All repositories have input validation
- [ ] All queries use explicit column selection
- [ ] Dashboard uses caching
- [ ] Database indexes are created
- [ ] Rate limiting is enabled on sensitive endpoints
- [ ] Error handling is standardized
- [ ] Monitoring is set up
- [ ] Frontend uses debounce for user input
- [ ] Tests pass with new validation
- [ ] Documentation is updated

## Troubleshooting

### Cache Not Working

Check cache TTL:
```typescript
import { CACHE_TTL } from "@/utils/cache"
// Adjust if needed
```

### Validation Errors

Check validation requirements:
```typescript
// Check what error was thrown
try {
  validateEmail("invalid-email")
} catch (error) {
  console.error(error.message)
}
```

### Rate Limiting Blocking Legitimate Requests

Adjust limits:
```typescript
const limits = {
  ...RATE_LIMITS.API,
  maxRequests: 60 // Increase from 30 to 60
}
```

## Support

For issues or questions:
1. Check PERFORMANCE_OPTIMIZATION.md for detailed info
2. Review relevant utility source code (utils/*.ts)
3. Check test examples in repositories
4. Open an issue on GitHub

## References

- Validation: `utils/validation.ts`
- Error Handling: `utils/errorHandling.ts`
- Caching: `utils/cache.ts`
- Rate Limiting: `utils/rateLimit.ts`
- Monitoring: `utils/monitoring.ts`
- Performance: `utils/performance.ts`
- Detailed Guide: `PERFORMANCE_OPTIMIZATION.md`
