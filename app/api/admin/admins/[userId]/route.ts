import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuthResult, getAdminManagementAccess } from "@/lib/adminAuth";
import type { AdminRole } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  role: z.enum(["admin", "super_admin"]),
});

interface AdminMutationResult {
  ok: boolean;
  error_code?: "not_found" | "last_admin" | "last_super_admin";
  previous_role?: AdminRole;
  next_role?: AdminRole;
}

function isAdminMutationResult(value: unknown): value is AdminMutationResult {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;
  if (typeof payload.ok !== "boolean") return false;

  if (payload.error_code !== undefined && typeof payload.error_code !== "string") return false;
  if (payload.previous_role !== undefined && typeof payload.previous_role !== "string") return false;
  if (payload.next_role !== undefined && typeof payload.next_role !== "string") return false;

  return true;
}

function toRoleUpdateErrorResponse(code: AdminMutationResult["error_code"]) {
  switch (code) {
    case "not_found":
      return NextResponse.json({ error: "対象の管理者が見つかりません。" }, { status: 404 });
    case "last_super_admin":
      return NextResponse.json({ error: "最後のスーパー管理者は降格できません。" }, { status: 422 });
    default:
      return NextResponse.json({ error: "権限の更新に失敗しました。" }, { status: 500 });
  }
}

function toAdminDeleteErrorResponse(code: AdminMutationResult["error_code"]) {
  switch (code) {
    case "not_found":
      return NextResponse.json({ error: "対象の管理者が見つかりません。" }, { status: 404 });
    case "last_admin":
      return NextResponse.json({ error: "最後の管理者は削除できません。" }, { status: 422 });
    case "last_super_admin":
      return NextResponse.json({ error: "最後のスーパー管理者は削除できません。" }, { status: 422 });
    default:
      return NextResponse.json({ error: "管理者権限の削除に失敗しました。" }, { status: 500 });
  }
}

function buildAdminRevokeAuditDetail(
  previousRole: AdminRole | undefined,
  actorAdminId: string,
  targetAdminId: string
) {
  if (actorAdminId === targetAdminId) {
    return { role: previousRole, actor_admin_id: actorAdminId };
  }

  return { role: previousRole };
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

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("update_admin_role_safely", {
    p_user_id: userId,
    p_next_role: parsed.data.role,
  });

  if (error) {
    console.error("safe admin role update failed", error);
    return NextResponse.json({ error: "権限の更新に失敗しました。" }, { status: 500 });
  }

  if (!isAdminMutationResult(data)) {
    console.error("safe admin role update returned invalid payload", data);
    return NextResponse.json({ error: "権限の更新に失敗しました。" }, { status: 500 });
  }

  if (!data.ok) {
    return toRoleUpdateErrorResponse(data.error_code);
  }

  if (data.previous_role === data.next_role) {
    return NextResponse.json({ ok: true });
  }

  const { error: auditError } = await admin.from("audit_logs").insert({
    admin_id: auth.user.id,
    action: "update_admin_role",
    target_type: "admin",
    target_id: userId,
    detail: { before: data.previous_role, after: data.next_role },
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

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("revoke_admin_safely", {
    p_user_id: userId,
  });

  if (error) {
    console.error("safe admin revoke failed", error);
    return NextResponse.json({ error: "管理者権限の削除に失敗しました。" }, { status: 500 });
  }

  if (!isAdminMutationResult(data)) {
    console.error("safe admin revoke returned invalid payload", data);
    return NextResponse.json({ error: "管理者権限の削除に失敗しました。" }, { status: 500 });
  }

  if (!data.ok) {
    return toAdminDeleteErrorResponse(data.error_code);
  }

  const isSelfRevoke = auth.user.id === userId;
  const { error: auditError } = await admin.from("audit_logs").insert({
    admin_id: isSelfRevoke ? null : auth.user.id,
    action: "revoke_admin",
    target_type: "admin",
    target_id: userId,
    detail: buildAdminRevokeAuditDetail(data.previous_role, auth.user.id, userId),
  });

  if (auditError) {
    console.error("audit log insert failed (revoke_admin)", auditError);
  }

  return NextResponse.json({ ok: true });
}
