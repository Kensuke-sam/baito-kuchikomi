import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminAuthResult } from "@/lib/adminAuth";
import { sanitizeText } from "@/lib/sanitize";

const schema = z.object({
  status: z.enum(["approved", "rejected", "removed", "needs_revision"]),
  admin_notes: z.string().max(500).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuthResult();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "不正なIDです。" }, { status: 400 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }
  if (parsed.data.status === "needs_revision" && !parsed.data.admin_notes?.trim()) {
    return NextResponse.json({ error: "要修正にする場合は管理メモを入力してください。" }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { data: existingReview, error: existingError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (!existingReview) {
    return NextResponse.json({ error: "対象の体験談が見つかりません。" }, { status: 404 });
  }

  const { error } = await supabase
    .from("reviews")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const adminNotes = parsed.data.admin_notes ? sanitizeText(parsed.data.admin_notes).slice(0, 500) : null;

  // 監査ログ
  const { error: auditError } = await supabase.from("audit_logs").insert({
    admin_id:    auth.user.id,
    action:      `${parsed.data.status}_review`,
    target_type: "review",
    target_id:   id,
    detail:      adminNotes ? { notes: adminNotes } : null,
  });

  if (auditError) {
    return NextResponse.json({ error: "監査ログの記録に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
