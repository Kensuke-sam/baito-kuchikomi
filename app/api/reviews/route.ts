import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeShortText, sanitizeText } from "@/lib/sanitize";
import { REVIEW_TAGS } from "@/lib/types";
import { randomBytes } from "crypto";

const VALID_TAGS = REVIEW_TAGS as unknown as string[];

const schema = z.object({
  place_id:    z.string().uuid(),
  title:       z.string().min(5).max(100),
  body:        z.string().min(50).max(3000),
  tags:        z.array(z.string()).max(8).refine(
    (arr) => arr.every((t) => VALID_TAGS.includes(t)),
    { message: "不正なタグが含まれています。" }
  ),
  period_from: z.string().max(30).optional(),
  period_to:   z.string().max(30).optional(),
});

export async function POST(req: Request) {
  const ip = getRealIp(req);
  const { allowed } = rateLimit(`reviews:${ip}`, 5, 10 * 60 * 1000);
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
  const authorToken = randomBytes(16).toString("hex");

  const supabase = createAdminClient();

  // 勤務先が存在するか確認（pending/approved）
  const { data: place } = await supabase
    .from("places")
    .select("id, status")
    .eq("id", d.place_id)
    .in("status", ["pending", "approved"])
    .single();

  if (!place) {
    return NextResponse.json({ error: "指定した勤務先が見つかりません。" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      place_id:     d.place_id,
      title:        sanitizeShortText(d.title, 100),
      body:         sanitizeText(d.body),
      tags:         d.tags,
      period_from:  d.period_from ? sanitizeShortText(d.period_from, 30) : null,
      period_to:    d.period_to   ? sanitizeShortText(d.period_to, 30)   : null,
      status:       "pending",
      author_token: authorToken,
      author_ip:    ip,
      author_ua:    ua.slice(0, 500),
    })
    .select("id")
    .single();

  if (error) {
    console.error("reviews insert failed", error);
    return NextResponse.json({ error: "体験談の投稿に失敗しました。" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
