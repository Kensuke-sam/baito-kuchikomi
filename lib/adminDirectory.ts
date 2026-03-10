import type { User } from "@supabase/supabase-js";
import type { AdminMember, AdminRole } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/server";

type AdminRow = {
  user_id: string;
  role: AdminRole;
  created_at: string;
};

export async function listAdminMembers(): Promise<AdminMember[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admins")
    .select("user_id, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("admin list failed", error);
    throw new Error("管理者一覧の取得に失敗しました。");
  }

  const rows = (data ?? []) as AdminRow[];
  const users = await Promise.all(
    rows.map(async (row) => {
      const { data: userData, error: userError } = await admin.auth.admin.getUserById(row.user_id);
      if (userError) {
        console.error("admin user lookup failed", row.user_id, userError);
      }

      return {
        ...row,
        email: userData.user?.email ?? null,
      };
    })
  );

  return users;
}

export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });

    if (error) {
      console.error("auth user search failed", error);
      throw new Error("ユーザー検索に失敗しました。");
    }

    const matched = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (matched) {
      return matched;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}
