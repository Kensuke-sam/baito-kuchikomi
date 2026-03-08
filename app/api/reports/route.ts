import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeShortText, sanitizeText } from "@/lib/sanitize";
import { REPORT_REASONS } from "@/lib/types";

const VALID_REASONS = REPORT_REASONS as unknown as string[];

const schema = z.object({
  target_type: z.enum(["place", "review"]),
  target_id:   z.string().uuid(),
  reason:      z.string().refine((r) => VALID_REASONS.includes(r), { message: "不正な理由です。" }),
  detail:      z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const ip = getRealIp(req);
  const { allowed } = rateLimit(`reports:${ip}`, 10, 10 * 60 * 1000);
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
  const targetTable = d.target_type === "place" ? "places" : "reviews";

  const { data: target, error: targetError } = await supabase
    .from(targetTable)
    .select("id")
    .eq("id", d.target_id)
    .eq("status", "approved")
    .maybeSingle();

  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "通報対象が見つかりません。" }, { status: 404 });
  }

  const { error } = await supabase.from("reports").insert({
    target_type:  d.target_type,
    target_id:    d.target_id,
    reason:       sanitizeShortText(d.reason),
    detail:       d.detail ? sanitizeText(d.detail) : null,
    reporter_ip:  ip,
    reporter_ua:  ua.slice(0, 500),
    status:       "received",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
