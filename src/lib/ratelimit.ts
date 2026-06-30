// Rate limiting is optional — requires Upstash Redis credentials
// When UPSTASH_REDIS_REST_URL is not set, all rate-limit checks pass through
//
// To enable:
// 1. Create a free database at https://console.upstash.com
// 2. Add to .env.local:
//    UPSTASH_REDIS_REST_URL=https://...
//    UPSTASH_REDIS_REST_TOKEN=...

export type RateLimitResult = { success: boolean; limit: number; remaining: number };

async function check(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Pass through if not configured
  if (!url || !token) {
    return { success: true, limit, remaining: limit };
  }

  const now = Date.now();
  const window = Math.floor(now / windowMs);
  const redisKey = `ratelimit:${key}:${window}`;

  try {
    const res = await fetch(`${url}/incr/${redisKey}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { result: number };
    const count = data.result;

    if (count === 1) {
      // Set TTL on first request
      await fetch(`${url}/expire/${redisKey}/${Math.ceil(windowMs / 1000)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
    };
  } catch {
    // On error, allow the request
    return { success: true, limit, remaining: limit };
  }
}

export const authRatelimit = {
  limit: (ip: string) => check(`auth:${ip}`, 5, 15 * 60 * 1000),
};

export const apiRatelimit = {
  limit: (ip: string) => check(`api:${ip}`, 60, 60 * 1000),
};

export const connectionRatelimit = {
  limit: (ip: string) => check(`conn:${ip}`, 10, 60 * 60 * 1000),
};
