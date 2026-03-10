import { createClient } from "@supabase/supabase-js";

// ============================================================
// レート制限ユーティリティ
// 優先度: DB原子的RPC > DB check+insert > インメモリ
// ============================================================

// ---- インメモリフォールバック ----
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const store = new Map<string, RateLimitEntry>();
const MAX_STORE_SIZE = 10000;

function cleanupExpired() {
  if (store.size < MAX_STORE_SIZE) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

function inMemoryRateLimit(
  key: string,
  limit = 5,
  windowMs = 60 * 60 * 1000
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

// ---- Supabase service クライアント（サーバーサイド専用） ----
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ============================================================
// メイン関数: DB原子的RPC → DB check+insert → インメモリ の順で試行
// ============================================================
export async function checkRateLimit(
  ip: string,
  actionType: string,
  limit = 5,
  windowSecs = 3600
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = getServiceClient();

  // --- 1. 原子的 RPC (005_atomic_rate_limit_check) ---
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc(
        "check_and_record_rate_limit",
        {
          p_ip: ip,
          p_action_type: actionType,
          p_limit: limit,
          p_window_secs: windowSecs,
        }
      );
      if (!error && data !== null) {
        return {
          allowed: data.allowed as boolean,
          remaining: data.remaining as number,
        };
      }
    } catch {
      // RPC が未定義の場合はフォールバック
    }

    // --- 2. 旧 check_rate_limit + insert ---
    try {
      const { data: allowed, error: checkErr } = await supabase.rpc(
        "check_rate_limit",
        {
          p_ip: ip,
          p_action_type: actionType,
          p_limit: limit,
          p_window_secs: windowSecs,
        }
      );
      if (!checkErr) {
        if (allowed) {
          await supabase
            .from("submission_rate_limits")
            .insert({ ip, action_type: actionType });
        }
        return { allowed: allowed as boolean, remaining: allowed ? limit - 1 : 0 };
      }
    } catch {
      // DB が使えない場合はインメモリへ
    }
  }

  // --- 3. インメモリフォールバック ---
  return inMemoryRateLimit(`${ip}:${actionType}`, limit, windowSecs * 1000);
}

// ============================================================
// IP アドレス取得ユーティリティ
// ============================================================
export function getRealIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// 後方互換: 同期インメモリのみが必要な箇所向け
export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000
): { allowed: boolean; remaining: number } {
  return inMemoryRateLimit(key, limit, windowMs);
}
