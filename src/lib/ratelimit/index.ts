import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

// Conditionally create Redis client — only when env vars are present.
// This prevents crashes at import time in development or CI environments
// where UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set.
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? Redis.fromEnv()
  : null

function createRatelimit(
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
  prefix: string
): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter,
    timeout: 3000, // fail-open: if Redis doesn't respond in 3s, allow the request
    prefix,
  })
}

// ---------------------------------------------------------------------------
// Auth endpoints (used by login/signup flows when routed through API)
// ---------------------------------------------------------------------------

/** Login: 5 attempts per 15 minutes (brute force protection) */
export const loginRatelimit = createRatelimit(
  Ratelimit.slidingWindow(5, '15 m'),
  'rl:login'
)

/** Signup: 3 accounts per hour per IP */
export const signupRatelimit = createRatelimit(
  Ratelimit.slidingWindow(3, '1 h'),
  'rl:signup'
)

/** Password reset: 3 requests per 15 minutes */
export const passwordResetRatelimit = createRatelimit(
  Ratelimit.slidingWindow(3, '15 m'),
  'rl:reset'
)

// ---------------------------------------------------------------------------
// Public endpoints (keyed by IP address)
// ---------------------------------------------------------------------------

/** Email collection cards: 10 submissions per minute per IP */
export const emailCollectionRatelimit = createRatelimit(
  Ratelimit.slidingWindow(10, '1 m'),
  'rl:email'
)

/** Analytics tracking: 30 events per minute per IP */
export const analyticsRatelimit = createRatelimit(
  Ratelimit.slidingWindow(30, '1 m'),
  'rl:analytics'
)

// ---------------------------------------------------------------------------
// Authenticated endpoints (keyed by user ID)
// ---------------------------------------------------------------------------

/** Audio upload: 5 uploads per hour (expensive storage operation) */
export const audioUploadRatelimit = createRatelimit(
  Ratelimit.slidingWindow(5, '1 h'),
  'rl:audio'
)

/** General API: 60 requests per minute (dashboard operations) */
export const generalApiRatelimit = createRatelimit(
  Ratelimit.slidingWindow(60, '1 m'),
  'rl:api'
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the real client IP from Vercel/Next.js request headers.
 * Falls back to '127.0.0.1' in local development.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

/**
 * Standard 429 Too Many Requests response with Retry-After header.
 * `reset` is the Unix timestamp (ms) when the rate limit window resets.
 */
export function rateLimitResponse(reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000)
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(retryAfter, 1)) },
    }
  )
}

/**
 * Unified rate-limit check helper.
 *
 * - If limiter is null (Redis not configured), always allows through.
 * - If Redis times out (reason === 'timeout'), allows through (fail-open).
 * - Otherwise returns 429 when limit is exceeded.
 *
 * Usage:
 *   const rl = await checkRateLimit(generalApiRatelimit, user.id)
 *   if (!rl.allowed) return rl.response!
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  if (!limiter) return { allowed: true }

  const { success, reset, reason } = await limiter.limit(key)

  // Fail-open on Redis timeout — don't block users if Redis is down
  if (!success && reason !== 'timeout') {
    return { allowed: false, response: rateLimitResponse(reset) }
  }

  return { allowed: true }
}
