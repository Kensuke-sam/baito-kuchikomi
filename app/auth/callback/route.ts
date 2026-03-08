import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase SSR が必要とする認証コールバックルート。
 * メール確認・マジックリンク・OAuth など、code を session に交換する。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  // オープンリダイレクト防止: 相対パスのみ許可
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_callback_failed`);
}
