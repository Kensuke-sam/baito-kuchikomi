import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuthResult, getAdminManagementAccess } from "@/lib/adminAuth";
import type { AdminRole } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  role: z.enum(["admin", "super_admin"]),
});

async function getAdminRecord(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admins")
    .select("user_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  return { admin, data: data as { user_id: string; role: AdminRole } | null, error };
}

async function countAdmins(admin: ReturnType<typeof createAdminClient>, role?: AdminRole) {
  let query = admin
    .from("admins")
    .select("*", { count: "exact", head: true });

  if (role) {
    query = query.eq("role", role);
  }

  const { count, error } = await query;
  return { count: count ?? 0, error };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await getAdminAuthResult();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const access = await getAdminManagementAccess(auth);
  if (!access.canManageAdmins) {
    return NextResponse.json({ error: "スーパー管理者のみ操作できます。" }, { status: 403 });
  }

  const { userId } = await params;
  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ error: "不正なユーザーIDです。" }, { status: 400 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const { admin, data: targetAdmin, error: targetError } = await getAdminRecord(userId);
  if (targetError) {
    console.error("target admin lookup failed", targetError);
    return NextResponse.json({ error: "対象ユーザーの確認に失敗しました。" }, { status: 500 });
  }
  if (!targetAdmin) {
    return NextResponse.json({ error: "対象の管理者が見つかりません。" }, { status: 404 });
  }

  if (targetAdmin.role === parsed.data.role) {
    return NextResponse.json({ ok: true });
  }

  if (targetAdmin.role === "super_admin" && parsed.data.role !== "super_admin") {
    const { count: superAdminCount, error: countError } = await countAdmins(admin, "super_admin");
    if (countError) {
      console.error("super admin count failed", countError);
      return NextResponse.json({ error: "権限数の確認に失敗しました。" }, { status: 500 });
    }
    if (superAdminCount <= 1) {
      return NextResponse.json({ error: "最後のスーパー管理者は降格できません。" }, { status: 422 });
    }
  }

  const { error: updateError } = await admin
    .from("admins")
    .update({ role: parsed.data.role })
    .eq("user_id", userId);

  if (updateError) {
    console.error("admin role update failed", updateError);
    return NextResponse.json({ error: "権限の更新に失敗しました。" }, { status: 500 });
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    admin_id: auth.user.id,
    action: "update_admin_role",
    target_type: "admin",
    target_id: userId,
    detail: { before: targetAdmin.role, after: parsed.data.role },
  });

  if (auditError) {
    console.error("audit log insert failed (update_admin_role)", auditError);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await getAdminAuthResult();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const access = await getAdminManagementAccess(auth);
  if (!access.canManageAdmins) {
    return NextResponse.json({ error: "スーパー管理者のみ操作できます。" }, { status: 403 });
  }

  const { userId } = await params;
  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ error: "不正なユーザーIDです。" }, { status: 400 });
  }

  const { admin, data: targetAdmin, error: targetError } = await getAdminRecord(userId);
  if (targetError) {
    console.error("target admin lookup failed", targetError);
    return NextResponse.json({ error: "対象ユーザーの確認に失敗しました。" }, { status: 500 });
  }
  if (!targetAdmin) {
    return NextResponse.json({ error: "対象の管理者が見つかりません。" }, { status: 404 });
  }

  const { count: adminCount, error: adminCountError } = await countAdmins(admin);
  if (adminCountError) {
    console.error("admin count failed", adminCountError);
    return NextResponse.json({ error: "管理者数の確認に失敗しました。" }, { status: 500 });
  }
  if (adminCount <= 1) {
    return NextResponse.json({ error: "最後の管理者は削除できません。" }, { status: 422 });
  }

  if (targetAdmin.role === "super_admin") {
    const { count: superAdminCount, error: superAdminCountError } = await countAdmins(admin, "super_admin");
    if (superAdminCountError) {
      console.error("super admin count failed", superAdminCountError);
      return NextResponse.json({ error: "権限数の確認に失敗しました。" }, { status: 500 });
    }
    if (superAdminCount <= 1) {
      return NextResponse.json({ error: "最後のスーパー管理者は削除できません。" }, { status: 422 });
    }
  }

  const { error: deleteError } = await admin
    .from("admins")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    console.error("admin delete failed", deleteError);
    return NextResponse.json({ error: "管理者権限の削除に失敗しました。" }, { status: 500 });
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    admin_id: auth.user.id,
    action: "revoke_admin",
    target_type: "admin",
    target_id: userId,
    detail: { role: targetAdmin.role },
  });

  if (auditError) {
    console.error("audit log insert failed (revoke_admin)", auditError);
  }

  return NextResponse.json({ ok: true });
}
