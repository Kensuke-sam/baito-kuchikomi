import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuthResult, getAdminManagementAccess } from "@/lib/adminAuth";
import { findAuthUserByEmail } from "@/lib/adminDirectory";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["admin", "super_admin"]),
});

export async function POST(req: Request) {
  const auth = await getAdminAuthResult();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const access = await getAdminManagementAccess(auth);
  if (!access.canManageAdmins) {
    return NextResponse.json({ error: "スーパー管理者のみ操作できます。" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const targetUser = await findAuthUserByEmail(parsed.data.email);
  if (!targetUser) {
    return NextResponse.json({ error: "そのメールアドレスのユーザーが見つかりません。" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: existingAdmin, error: existingError } = await admin
    .from("admins")
    .select("user_id")
    .eq("user_id", targetUser.id)
    .maybeSingle();

  if (existingError) {
    console.error("existing admin lookup failed", existingError);
    return NextResponse.json({ error: "管理者状態の確認に失敗しました。" }, { status: 500 });
  }

  if (existingAdmin) {
    return NextResponse.json({ error: "このユーザーには既に管理者権限があります。" }, { status: 409 });
  }

  const { error: insertError } = await admin
    .from("admins")
    .insert({ user_id: targetUser.id, role: parsed.data.role });

  if (insertError) {
    console.error("admin insert failed", insertError);
    return NextResponse.json({ error: "管理者の追加に失敗しました。" }, { status: 500 });
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    admin_id: auth.user.id,
    action: "grant_admin",
    target_type: "admin",
    target_id: targetUser.id,
    detail: { email: targetUser.email, role: parsed.data.role },
  });

  if (auditError) {
    console.error("audit log insert failed (grant_admin)", auditError);
  }

  return NextResponse.json({ ok: true });
}
