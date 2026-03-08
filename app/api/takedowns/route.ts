import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeShortText, sanitizeText, sanitizeEmail, sanitizeUrl } from "@/lib/sanitize";
import { TAKEDOWN_REASONS } from "@/lib/types";

const VALID_REASONS = TAKEDOWN_REASONS as unknown as string[];

const schema = z.object({
  target_url:    z.string().url().max(2000),
  contact_name:  z.string().min(1).max(100),
  contact_email: z.string().email().max(254),
  reason:        z.string().refine((r) => VALID_REASONS.includes(r), { message: "不正な理由です。" }),
  detail:        z.string().min(10).max(2000),
  evidence_url:  z.string().url().max(2000).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const ip = getRealIp(req);
  const { allowed } = rateLimit(`takedowns:${ip}`, 5, 60 * 60 * 1000); // 1時間5件
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
  const supabase = createAdminClient();

  const { error } = await supabase.from("takedown_requests").insert({
    target_url:    sanitizeUrl(d.target_url),
    contact_name:  sanitizeShortText(d.contact_name),
    contact_email: sanitizeEmail(d.contact_email),
    reason:        sanitizeShortText(d.reason),
    detail:        sanitizeText(d.detail),
    evidence_url:  d.evidence_url ? sanitizeUrl(d.evidence_url) : null,
    status:        "received",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
