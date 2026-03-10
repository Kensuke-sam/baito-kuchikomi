import type { User } from "@supabase/supabase-js";
import type { AdminRole } from "@/lib/types";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export interface AdminAuthResult {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: AdminRole | null;
}

export interface AdminManagementAccess {
  canManageAdmins: boolean;
  superAdminCount: number;
}

export async function getAdminAuthResult(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false, isSuperAdmin: false, role: null };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return { user, isAdmin: false, isSuperAdmin: false, role: null };
  }

  return { user, isAdmin: true, isSuperAdmin: data.role === "super_admin", role: data.role };
}

export async function getAdminManagementAccess(
  auth?: AdminAuthResult
): Promise<AdminManagementAccess> {
  const currentAuth = auth ?? await getAdminAuthResult();
  if (!currentAuth.user || !currentAuth.isAdmin) {
    return { canManageAdmins: false, superAdminCount: 0 };
  }

  const admin = createAdminClient();
  const { count, error } = await admin
    .from("admins")
    .select("*", { count: "exact", head: true })
    .eq("role", "super_admin");

  if (error) {
    console.error("super admin count failed", error);
    return {
      canManageAdmins: currentAuth.isSuperAdmin,
      superAdminCount: currentAuth.isSuperAdmin ? 1 : 0,
    };
  }

  const superAdminCount = count ?? 0;
  return {
    canManageAdmins: currentAuth.isSuperAdmin || superAdminCount === 0,
    superAdminCount,
  };
}
