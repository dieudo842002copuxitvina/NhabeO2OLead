/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  RATE LIMITING UTILITY                                        ║
 * ║  Simple in-memory rate limiter for API routes                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Usage:
 *   import { rateLimit } from '@/lib/rate-limit';
 *   
 *   export async function POST(req) {
 *     const { success, remaining, reset } = await rateLimit(req, {
 *       limit: 10,
 *       windowMs: 60 * 1000, // 1 minute
 *       keyBy: 'ip', // or 'header'
 *     });
 *     
 *     if (!success) {
 *       return NextResponse.json(
 *         { error: 'Too many requests' },
 *         { status: 429, headers: { 'Retry-After': String(reset) } }
 *       );
 *     }
 *     // ... handle request
 *   }
 */

import { NextRequest, NextResponse } from "next/server";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyBy?: "ip" | "header";
  keyName?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * IN-MEMORY STORE (for single-instance deployment)
 * For production with multiple instances, use Redis or Upstash
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function getClientKey(request: NextRequest, config: RateLimitConfig): string {
  if (config.keyBy === "header" && config.keyName) {
    return request.headers.get(config.keyName) || "anonymous";
  }

  // Default: use IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN RATE LIMIT FUNCTION
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowMs } = config;
  const key = getClientKey(request, config);
  const now = Date.now();

  // Get or create entry
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  } else {
    // Increment count
    entry.count++;
  }

  const remaining = Math.max(0, limit - entry.count);
  const reset = Math.ceil((entry.resetTime - now) / 1000);

  return {
    success: entry.count <= limit,
    remaining,
    reset,
    limit,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRE-BUILT LIMITERS FOR COMMON USE CASES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const defaultConfig: RateLimitConfig = {
    limit: config.limit || 100,
    windowMs: config.windowMs || 60000, // 1 minute
    keyBy: config.keyBy || "ip",
    keyName: config.keyName,
  };

  return async (request: NextRequest): Promise<RateLimitResult> => {
    return rateLimit(request, defaultConfig);
  };
}

// Common rate limiters
export const limiters = {
  // Strict: 5 requests per minute (for form submissions)
  strict: createRateLimiter({ limit: 5, windowMs: 60000 }),

  // Standard: 30 requests per minute (for general API)
  standard: createRateLimiter({ limit: 30, windowMs: 60000 }),

  // Lenient: 100 requests per minute (for read operations)
  lenient: createRateLimiter({ limit: 100, windowMs: 60000 }),

  // Very lenient: 300 requests per minute (for data fetching)
  veryLenient: createRateLimiter({ limit: 300, windowMs: 60000 }),

  // Per hour: 100 requests per hour
  hourly: createRateLimiter({ limit: 100, windowMs: 3600000 }),

  // Daily: 1000 requests per day
  daily: createRateLimiter({ limit: 1000, windowMs: 86400000 }),
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * RESPONSE HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const headers = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": String(result.reset),
  };

  return NextResponse.json(
    {
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please retry after ${result.reset} seconds.`,
      retryAfter: result.reset,
    },
    { status: 429, headers }
  );
}

export function isRateLimited(result: RateLimitResult): boolean {
  return !result.success;
}
