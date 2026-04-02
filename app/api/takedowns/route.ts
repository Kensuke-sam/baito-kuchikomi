import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { createRateLimitHeaders, rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeShortText, sanitizeText, sanitizeEmail, sanitizeUrl } from "@/lib/sanitize";
import { TAKEDOWN_REASONS } from "@/lib/types";
import { sendAdminNotification } from "@/lib/notifications";
import { getSiteUrl } from "@/lib/siteUrl";

const VALID_REASON_SET = new Set<string>(TAKEDOWN_REASONS);

const schema = z.object({
  target_url:    z.string().url().max(2000),
  contact_name:  z.string().min(1).max(100),
  contact_email: z.string().email().max(254),
  reason:        z.string().refine((r) => VALID_REASON_SET.has(r), { message: "不正な理由です。" }),
  detail:        z.string().min(10).max(2000),
  evidence_url:  z.string().url().max(2000).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const ip = getRealIp(req);
  const rate = await rateLimit(`takedowns:${ip}`, 5, 60 * 60 * 1000); // 1時間5件
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
  const supabase = createAdminClient();
  const targetUrl = sanitizeUrl(d.target_url);
  const contactName = sanitizeShortText(d.contact_name);
  const contactEmail = sanitizeEmail(d.contact_email);
  const reason = sanitizeShortText(d.reason);
  const detail = sanitizeText(d.detail);
  const evidenceUrl = d.evidence_url ? sanitizeUrl(d.evidence_url) : null;

  if (!targetUrl || !contactName || !contactEmail || detail.length < 10) {
    return NextResponse.json(
      { error: "削除申請の入力内容を確認してください。" },
      { status: 422 }
    );
  }

  const siteOrigin = new URL(getSiteUrl()).origin;
  if (!targetUrl.startsWith(siteOrigin + "/") && targetUrl !== siteOrigin) {
    return NextResponse.json(
      { error: "削除申請はこのサイトのURLのみ受け付けています。" },
      { status: 422 }
    );
  }

  const { error } = await supabase.from("takedown_requests").insert({
    target_url:    targetUrl,
    contact_name:  contactName,
    contact_email: contactEmail,
    reason,
    detail,
    evidence_url:  evidenceUrl,
    status:        "received",
  });

  if (error) {
    console.error("takedown insert failed", error);
    return NextResponse.json({ error: "削除申請の送信に失敗しました。" }, { status: 500 });
  }

  await sendAdminNotification({
    subject: "[バイト体験談マップ] 新しい削除申請",
    lines: [
      "新しい削除申請を受け付けました。",
      `理由: ${reason}`,
      "詳細は管理画面で確認してください。",
    ],
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
