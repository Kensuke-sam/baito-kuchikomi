import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/sanitize";
import { sendAdminNotification } from "@/lib/notifications";

const schema = z.object({
  place_id: z.string().uuid(),
  body:     z.string().min(20).max(2000),
});

export async function POST(req: Request) {
  const ip = getRealIp(req);
  const { allowed } = rateLimit(`official:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "しばらく待ってから再試行してください。" }, { status: 429 });
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
  const responseBody = sanitizeText(d.body);

  const { data: place, error: placeError } = await supabase
    .from("places")
    .select("id")
    .eq("id", d.place_id)
    .eq("status", "approved")
    .maybeSingle();

  if (placeError) {
    return NextResponse.json({ error: placeError.message }, { status: 500 });
  }
  if (!place) {
    return NextResponse.json({ error: "対象の勤務先が見つかりません。" }, { status: 404 });
  }

  const { error } = await supabase.from("official_responses").insert({
    place_id:   d.place_id,
    body:       responseBody,
    status:     "pending",
    sender_ip:  ip,
    sender_ua:  ua.slice(0, 500),
  });

  if (error) {
    console.error("official_responses insert failed", error);
    return NextResponse.json({ error: "コメントの送信に失敗しました。" }, { status: 500 });
  }

  await sendAdminNotification({
    subject: "[バイト体験談マップ] 新しい当事者コメント",
    lines: [
      "新しい当事者コメントを受け付けました。",
      `勤務先ID: ${d.place_id}`,
      `本文: ${responseBody}`,
    ],
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
