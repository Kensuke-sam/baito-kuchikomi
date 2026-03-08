import type { User } from "@supabase/supabase-js";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export interface AdminAuthResult {
  user: User | null;
  isAdmin: boolean;
  role: "admin" | "super_admin" | null;
}

export async function getAdminAuthResult(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false, role: null };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return { user, isAdmin: false, role: null };
  }

  return { user, isAdmin: true, role: data.role };
}
