/**
 * シンプルなインメモリ Rate Limiter
 * Vercel の単一インスタンスでの MVP 用。
 * 本番は Upstash Redis + @upstash/ratelimit に換装する。
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000;

// rateLimit 呼び出し時に期限切れエントリを遅延クリーンアップ
function cleanupExpired() {
  if (store.size < MAX_STORE_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

/**
 * @param key      IPアドレスなど識別子
 * @param limit    許可リクエスト数
 * @param windowMs ウィンドウ（ms）
 * @returns { allowed: boolean, remaining: number }
 */
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000 // 10分
): { allowed: boolean; remaining: number } {
  cleanupExpired();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function getRealIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
