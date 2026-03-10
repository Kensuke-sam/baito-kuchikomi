import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminAuthResult } from "@/lib/adminAuth";

const schema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuthResult();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();

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

  const { data: existingResponse, error: existingError } = await admin
    .from("official_responses")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    console.error("official response lookup failed", existingError);
    return NextResponse.json({ error: "当事者コメントの確認に失敗しました。" }, { status: 500 });
  }
  if (!existingResponse) {
    return NextResponse.json({ error: "対象の当事者コメントが見つかりません。" }, { status: 404 });
  }

  const { error } = await admin
    .from("official_responses")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    console.error("official response update failed", error);
    return NextResponse.json({ error: "当事者コメントの更新に失敗しました。" }, { status: 500 });
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    admin_id:    auth.user.id,
    action:      `${parsed.data.status}_official_response`,
    target_type: "official_response",
    target_id:   id,
  });

  if (auditError) {
    console.error("audit log insert failed (official_response)", auditError);
  }

  return NextResponse.json({ ok: true });
}
