import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { createRateLimitHeaders, rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeShortText, sanitizeText } from "@/lib/sanitize";
import { REPORT_REASONS } from "@/lib/types";
import { sendAdminNotification } from "@/lib/notifications";

const VALID_REASONS = REPORT_REASONS as unknown as string[];

const schema = z.object({
  target_type: z.enum(["place", "review"]),
  target_id:   z.string().uuid(),
  reason:      z.string().refine((r) => VALID_REASONS.includes(r), { message: "不正な理由です。" }),
  detail:      z.string().max(1000).optional(),
});

const AUTO_HIDE_THRESHOLD = 3;

export async function POST(req: Request) {
  const ip = getRealIp(req);
  const rate = await rateLimit(`reports:${ip}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "しばらく待ってから再試行してください。" },
      { status: 429, headers: createRateLimitHeaders(rate) }
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const d = parsed.data;
  const ua = req.headers.get("user-agent") ?? "";
  const supabase = createAdminClient();
  const targetTable = d.target_type === "place" ? "places" : "reviews";
  const reason = sanitizeShortText(d.reason);
  const detail = d.detail ? sanitizeText(d.detail) : null;

  const { data: target, error: targetError } = await supabase
    .from(targetTable)
    .select("id")
    .eq("id", d.target_id)
    .eq("status", "approved")
    .maybeSingle();

  if (targetError) {
    console.error("report target check failed", targetError);
    return NextResponse.json({ error: "通報対象の確認に失敗しました。" }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "通報対象が見つかりません。" }, { status: 404 });
  }

  // 同一 IP から同じ対象への重複通報を防止
  const { data: existingReport, error: existingError } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_ip", ip)
    .eq("target_type", d.target_type)
    .eq("target_id", d.target_id)
    .maybeSingle();

  if (existingError) {
    console.error("report existing check failed", existingError);
    return NextResponse.json({ error: "通報の確認に失敗しました。" }, { status: 500 });
  }

  if (existingReport) {
    return NextResponse.json(
      { error: "この投稿は既に通報済みです。" },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("reports").insert({
    target_type:  d.target_type,
    target_id:    d.target_id,
    reason,
    detail,
    reporter_ip:  ip,
    reporter_ua:  ua.slice(0, 500),
    status:       "received",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "この投稿は既に通報済みです。" },
        { status: 409 }
      );
    }

    console.error("reports insert failed", error);
    return NextResponse.json({ error: "通報の送信に失敗しました。" }, { status: 500 });
  }

  // 通報件数を確認して自動非表示の発動を通知に含める
  const { count, error: reportCountError } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("target_type", d.target_type)
    .eq("target_id", d.target_id);

  if (reportCountError) {
    console.error("reports count failed", reportCountError);
  }

  const reportCount = reportCountError ? null : (count ?? 0);
  const wasAutoHidden = reportCount !== null && reportCount >= AUTO_HIDE_THRESHOLD;

  const notificationLines = [
    "新しい通報を受け付けました。",
    `対象種別: ${d.target_type}`,
    `対象ID: ${d.target_id}`,
    `理由: ${reason}`,
    `累計通報件数: ${reportCount ?? "取得失敗"}`,
    "詳細は管理画面で確認してください。",
  ];

  if (wasAutoHidden) {
    notificationLines.push(
      "",
      `⚠️ 通報が ${AUTO_HIDE_THRESHOLD} 件に達したため、自動的に非表示（承認待ち）に変更されました。管理画面で確認してください。`
    );
  }

  await sendAdminNotification({
    subject: wasAutoHidden
      ? "[バイト体験談マップ] ⚠️ 自動非表示: 通報が閾値に到達"
      : "[バイト体験談マップ] 新しい通報",
    lines: notificationLines,
  });

  return NextResponse.json({ ok: true, auto_hidden: wasAutoHidden }, { status: 201 });
}
