import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for a single-instance deployment. For multi-instance, swap with
 * Redis or a shared store. Limits are intentionally conservative to deter
 * brute-force and click-fraud without blocking legitimate users.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  /** Maximum requests allowed in the window. */
  limit: number;
  /** Window length in ms. */
  windowMs: number;
  /** Function to derive the key (usually IP + route). */
  keyFn?: (req: NextRequest) => string;
}

const DEFAULT_KEY = (req: NextRequest) => {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${req.nextUrl?.pathname ?? req.url}`;
};

/** Returns null if allowed, or a NextResponse (429) if rate-limited. */
export function rateLimit(
  req: NextRequest,
  opts: RateLimitOptions
): NextResponse | null {
  const key = (opts.keyFn || DEFAULT_KEY)(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > opts.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }
  return null;
}

/** Periodically prune expired buckets to keep memory bounded. */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }, 60_000).unref?.();
}
