"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";
import type { AdminMember, AdminRole } from "@/lib/types";

interface Props {
  members: AdminMember[];
  currentUserId: string;
  canManage: boolean;
  superAdminCount: number;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "管理者",
  super_admin: "スーパー管理者",
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  admin: "投稿や通報の管理はできますが、管理者権限の追加・変更・削除はできません。",
  super_admin: "投稿管理に加えて、管理者権限の追加・変更・削除まで担当できます。",
};

const ROLE_BADGES: Record<AdminRole, string> = {
  admin: "bg-blue-100 text-blue-800",
  super_admin: "bg-indigo-100 text-indigo-800",
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function AdminMembersManager({ members, currentUserId, canManage, superAdminCount }: Props) {
  const router = useRouter();
  const sortedMembers = [...members].sort((left, right) => {
    const rolePriority = Number(right.role === "super_admin") - Number(left.role === "super_admin");
    if (rolePriority !== 0) return rolePriority;

    const currentUserPriority = Number(right.user_id === currentUserId) - Number(left.user_id === currentUserId);
    if (currentUserPriority !== 0) return currentUserPriority;

    return left.created_at.localeCompare(right.created_at);
  });
  const [draftRoles, setDraftRoles] = useState<Record<string, AdminRole>>(
    Object.fromEntries(members.map((member) => [member.user_id, member.role]))
  );
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<AdminRole>("admin");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingKey("create");
    setError("");

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail, role: addRole }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "管理者の追加に失敗しました。"));
      }

      setAddEmail("");
      setAddRole("admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "管理者の追加に失敗しました。");
    } finally {
      setLoadingKey(null);
    }
  }

  async function updateRole(userId: string) {
    setLoadingKey(`update:${userId}`);
    setError("");

    try {
      const res = await fetch(`/api/admin/admins/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: draftRoles[userId] }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "権限の更新に失敗しました。"));
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "権限の更新に失敗しました。");
    } finally {
      setLoadingKey(null);
    }
  }

  async function removeMember(userId: string) {
    const targetMember = members.find((member) => member.user_id === userId);
    const label = targetMember?.email ?? "このユーザー";
    if (!window.confirm(`${label} の管理者権限を削除します。`)) {
      return;
    }

    setLoadingKey(`delete:${userId}`);
    setError("");

    try {
      const res = await fetch(`/api/admin/admins/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "管理者権限の削除に失敗しました。"));
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "管理者権限の削除に失敗しました。");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-gray-900">管理者を追加</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              先に対象ユーザーがログイン済みである必要があります。メールアドレスを指定すると、そのユーザーに
              管理画面へのアクセス権を付与できます。
            </p>
          </div>
          <div className={`rounded-2xl px-4 py-3 text-sm ${
            canManage
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-amber-200 bg-amber-50 text-amber-900"
          }`}>
            {canManage
              ? "このアカウントは追加・変更・削除まで操作できます。"
              : "このアカウントは閲覧のみです。追加・変更・削除はできません。"}
          </div>
        </div>

        {canManage ? (
          <form onSubmit={addMember} className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                メールアドレス
              </span>
              <input
                type="email"
                required
                value={addEmail}
                onChange={(event) => setAddEmail(event.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                付与する権限
              </span>
              <select
                value={addRole}
                onChange={(event) => setAddRole(event.target.value as AdminRole)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="admin">管理者</option>
                <option value="super_admin">スーパー管理者</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loadingKey !== null}
                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loadingKey === "create" ? "追加中…" : "管理者として追加"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">登録済みメンバー</h2>
            <p className="mt-1 text-sm text-gray-600">
              誰が投稿管理に入れて、誰が権限変更までできるかを一覧で確認できます。
            </p>
          </div>
          <div className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
            {members.length} 人
          </div>
        </div>

        <div className="space-y-4">
          {sortedMembers.map((member) => {
            const isCurrentUser = member.user_id === currentUserId;
            const isLastSuperAdmin = member.role === "super_admin" && superAdminCount === 1;
            const isLastAdmin = members.length === 1;
            const nextRole = draftRoles[member.user_id] ?? member.role;
            const willDemoteLastSuperAdmin = isLastSuperAdmin && nextRole !== "super_admin";
            const hasRoleChange = nextRole !== member.role;

            return (
              <article
                key={member.user_id}
                className={`rounded-2xl border p-5 shadow-sm transition-colors ${
                  isCurrentUser
                    ? "border-blue-200 bg-blue-50/60"
                    : member.role === "super_admin"
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {member.email ?? "メール不明"}
                      </h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_BADGES[member.role]}`}>
                        {ROLE_LABELS[member.role]}
                      </span>
                      {isCurrentUser && (
                        <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-semibold text-white">
                          あなた
                        </span>
                      )}
                      {hasRoleChange && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          未保存の変更
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {ROLE_DESCRIPTIONS[member.role]}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">User ID</p>
                        <p className="mt-2 break-all font-mono text-xs text-gray-600">{member.user_id}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">付与日</p>
                        <p className="mt-2 text-sm font-medium text-gray-700">{formatDate(member.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="xl:w-[340px]">
                    {canManage ? (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">権限の調整</p>
                        <div className="mt-3 space-y-3">
                          <select
                            value={nextRole}
                            onChange={(event) =>
                              setDraftRoles((current) => ({
                                ...current,
                                [member.user_id]: event.target.value as AdminRole,
                              }))
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="admin">管理者</option>
                            <option value="super_admin">スーパー管理者</option>
                          </select>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => updateRole(member.user_id)}
                              disabled={loadingKey !== null || !hasRoleChange || willDemoteLastSuperAdmin}
                              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {loadingKey === `update:${member.user_id}` ? "更新中…" : "変更を保存"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMember(member.user_id)}
                              disabled={loadingKey !== null || isLastAdmin || isLastSuperAdmin}
                              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {loadingKey === `delete:${member.user_id}` ? "削除中…" : "権限を削除"}
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-gray-500">
                          {willDemoteLastSuperAdmin && (
                            <p className="text-amber-700">最後のスーパー管理者は降格できません。</p>
                          )}
                          {isLastSuperAdmin && (
                            <p className="text-amber-700">最後のスーパー管理者は削除できません。</p>
                          )}
                          {isLastAdmin && (
                            <p className="text-amber-700">最後の管理者は削除できません。</p>
                          )}
                          {!willDemoteLastSuperAdmin && !isLastSuperAdmin && !isLastAdmin && (
                            <p>変更は保存ボタンを押すまで反映されません。</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
                        このアカウントでは閲覧のみ可能です。権限変更が必要な場合はスーパー管理者に依頼してください。
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
