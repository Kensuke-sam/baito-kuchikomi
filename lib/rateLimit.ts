import { createAdminClient } from "@/lib/supabase/server";

/**
 * Supabase の永続レート制限。
 * DB 未適用時のみインメモリ実装へフォールバックする。
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

type RateLimitRpcPayload = {
  allowed: boolean;
  remaining: number;
  limit?: number;
  window_secs?: number;
  reset_at?: number;
  retry_after?: number;
};

const store = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000;
const RPC_RETRY_COOLDOWN_MS = 60_000;

let nextAtomicRpcRetryAt = 0;
let nextLegacyRpcRetryAt = 0;

function cleanupExpired() {
  if (store.size < MAX_STORE_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

function rateLimitInMemory(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): RateLimitResult {
  cleanupExpired();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAt: Math.ceil(resetAt / 1000),
      retryAfter: Math.max(1, Math.ceil(windowMs / 1000)),
    };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: Math.ceil(entry.resetAt / 1000),
      retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: Math.ceil(entry.resetAt / 1000),
    retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

function parseRateLimitKey(key: string) {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex === -1) {
    return { actionType: key, ip: "unknown" };
  }

  return {
    actionType: key.slice(0, separatorIndex),
    ip: key.slice(separatorIndex + 1) || "unknown",
  };
}

async function cleanupRateLimits(supabase: ReturnType<typeof createAdminClient>) {
  try {
    const { error } = await supabase.rpc("cleanup_rate_limits");
    if (error) {
      console.error("rate limit cleanup failed", error);
    }
  } catch (error) {
    console.error("rate limit cleanup threw", error);
  }
}

async function readRateLimitWindowState(
  supabase: ReturnType<typeof createAdminClient>,
  actionType: string,
  ip: string,
  limit: number,
  windowMs: number,
  allowed: boolean
): Promise<RateLimitResult | null> {
  try {
    const windowStart = new Date(Date.now() - windowMs).toISOString();
    const { data, count, error } = await supabase
      .from("submission_rate_limits")
      .select("created_at", { count: "exact" })
      .eq("ip", ip)
      .eq("action_type", actionType)
      .gt("created_at", windowStart)
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      console.error("rate limit state lookup failed", error);
      return null;
    }

    const now = Date.now();
    const oldestCreatedAt = data?.[0]?.created_at ? new Date(data[0].created_at).getTime() : now;
    const resetAtMs = Math.max(now + 1000, oldestCreatedAt + windowMs);

    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - (count ?? 0)),
      resetAt: Math.ceil(resetAtMs / 1000),
      retryAfter: Math.max(1, Math.ceil((resetAtMs - now) / 1000)),
    };
  } catch (error) {
    console.error("rate limit state lookup threw", error);
    return null;
  }
}

function createApproximateRateLimitResult(
  allowed: boolean,
  limit: number,
  remaining: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  return {
    allowed,
    limit,
    remaining: Math.max(0, Math.min(limit, remaining)),
    resetAt: Math.ceil((now + windowMs) / 1000),
    retryAfter: Math.max(1, Math.ceil(windowMs / 1000)),
  };
}

function isRateLimitRpcPayload(value: unknown): value is RateLimitRpcPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.allowed === "boolean" && typeof payload.remaining === "number";
}

function hasExactRateLimitMetadata(
  payload: RateLimitRpcPayload
): payload is RateLimitRpcPayload & { reset_at: number; retry_after: number } {
  return typeof payload.reset_at === "number" && typeof payload.retry_after === "number";
}

function createResultFromRpcPayload(
  defaultLimit: number,
  defaultWindowMs: number,
  payload: RateLimitRpcPayload
): RateLimitResult {
  const limit = typeof payload.limit === "number" ? payload.limit : defaultLimit;
  const windowMs =
    typeof payload.window_secs === "number"
      ? Math.max(1000, payload.window_secs * 1000)
      : defaultWindowMs;

  if (hasExactRateLimitMetadata(payload)) {
    return {
      allowed: payload.allowed,
      limit,
      remaining: Math.max(0, payload.remaining),
      resetAt: payload.reset_at,
      retryAfter: Math.max(1, payload.retry_after),
    };
  }

  return createApproximateRateLimitResult(payload.allowed, limit, payload.remaining, windowMs);
}

async function recordRateLimitHit(
  supabase: ReturnType<typeof createAdminClient>,
  actionType: string,
  ip: string
) {
  try {
    const { error } = await supabase.from("submission_rate_limits").insert({
      ip,
      action_type: actionType,
    });

    if (error) {
      console.error("rate limit insert failed", error);
      return;
    }

    void cleanupRateLimits(supabase);
  } catch (error) {
    console.error("rate limit insert threw", error);
  }
}

async function rateLimitWithSupabase(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  if (Date.now() < nextAtomicRpcRetryAt) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { actionType, ip } = parseRateLimitKey(key);
    const { data, error } = await supabase.rpc("check_and_record_rate_limit", {
      p_ip: ip,
      p_action_type: actionType,
      p_limit: limit,
      p_window_secs: Math.max(1, Math.ceil(windowMs / 1000)),
    });

    if (error) {
      nextAtomicRpcRetryAt = Date.now() + RPC_RETRY_COOLDOWN_MS;
      console.error("atomic rate limit rpc failed", error);
      return null;
    }

    if (isRateLimitRpcPayload(data)) {
      nextAtomicRpcRetryAt = 0;
      void cleanupRateLimits(supabase);

      if (hasExactRateLimitMetadata(data)) {
        return createResultFromRpcPayload(limit, windowMs, data);
      }

      return (
        await readRateLimitWindowState(supabase, actionType, ip, limit, windowMs, data.allowed)
      ) ?? createResultFromRpcPayload(limit, windowMs, data);
    }

    if (typeof data !== "boolean") {
      nextAtomicRpcRetryAt = Date.now() + RPC_RETRY_COOLDOWN_MS;
      console.error("atomic rate limit rpc returned invalid payload", data);
      return null;
    }

    nextAtomicRpcRetryAt = 0;
    void cleanupRateLimits(supabase);
    return (
      await readRateLimitWindowState(supabase, actionType, ip, limit, windowMs, data)
    ) ?? createApproximateRateLimitResult(data, limit, data ? limit - 1 : 0, windowMs);
  } catch (error) {
    nextAtomicRpcRetryAt = Date.now() + RPC_RETRY_COOLDOWN_MS;
    console.error("atomic rate limit rpc threw", error);
    return null;
  }
}

async function rateLimitWithSupabaseLegacy(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  if (Date.now() < nextLegacyRpcRetryAt) {
    return null;
  }

  try {
    const supabase = createAdminClient();
    const { actionType, ip } = parseRateLimitKey(key);
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_ip: ip,
      p_action_type: actionType,
      p_limit: limit,
      p_window_secs: Math.max(1, Math.ceil(windowMs / 1000)),
    });

    if (error) {
      nextLegacyRpcRetryAt = Date.now() + RPC_RETRY_COOLDOWN_MS;
      console.error("legacy rate limit rpc failed", error);
      return null;
    }

    if (typeof data !== "boolean") {
      nextLegacyRpcRetryAt = Date.now() + RPC_RETRY_COOLDOWN_MS;
      console.error("legacy rate limit rpc returned invalid payload", data);
      return null;
    }

    if (data) {
      await recordRateLimitHit(supabase, actionType, ip);
    }

    nextLegacyRpcRetryAt = 0;
    return (
      await readRateLimitWindowState(supabase, actionType, ip, limit, windowMs, data)
    ) ?? createApproximateRateLimitResult(data, limit, data ? limit - 1 : 0, windowMs);
  } catch (error) {
    nextLegacyRpcRetryAt = Date.now() + RPC_RETRY_COOLDOWN_MS;
    console.error("legacy rate limit rpc threw", error);
    return null;
  }
}

export async function rateLimit(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): Promise<RateLimitResult> {
  const atomicResult = await rateLimitWithSupabase(key, limit, windowMs);
  if (atomicResult) {
    return atomicResult;
  }

  const legacyResult = await rateLimitWithSupabaseLegacy(key, limit, windowMs);
  if (legacyResult) {
    return legacyResult;
  }

  return rateLimitInMemory(key, limit, windowMs);
}

export async function checkRateLimit(
  ip: string,
  actionType: string,
  limit = 5,
  windowSecs = 3600
): Promise<RateLimitResult> {
  return rateLimit(`${actionType}:${ip}`, limit, windowSecs * 1000);
}

export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(result.resetAt));

  if (!result.allowed) {
    headers.set("Retry-After", String(result.retryAfter));
  }

  return headers;
}

export function getRealIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
