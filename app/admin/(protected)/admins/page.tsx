import { AdminMembersManager } from "@/components/admin/AdminMembersManager";
import { getAdminAuthResult, getAdminManagementAccess } from "@/lib/adminAuth";
import { listAdminMembers } from "@/lib/adminDirectory";

export default async function AdminMembersPage() {
  const auth = await getAdminAuthResult();
  const access = await getAdminManagementAccess(auth);
  const members = await listAdminMembers();
  const currentMember = members.find((member) => member.user_id === auth.user?.id) ?? null;
  const adminCount = members.filter((member) => member.role === "admin").length;
  const superAdminCount = members.filter((member) => member.role === "super_admin").length;

  if (!auth.user) {
    return null;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-gray-900 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white">
              ADMIN ACCESS
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">管理者権限</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              投稿管理に入れるユーザーと、各ユーザーがどこまで操作できるかをここで確認できます。
              追加や変更が必要な場合も、この画面でそのまま調整できます。
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 shadow-sm xl:min-w-[320px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">あなたの状態</p>
            <p className="mt-2 text-base font-semibold text-gray-900">
              {currentMember?.email ?? auth.user.email ?? "メール不明"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                currentMember?.role === "super_admin"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {currentMember?.role === "super_admin" ? "スーパー管理者" : "管理者"}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                access.canManageAdmins
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-200 text-gray-700"
              }`}>
                {access.canManageAdmins ? "権限変更も可能" : "閲覧のみ"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "登録済み管理者", value: String(members.length), tone: "border-gray-200 bg-gray-50 text-gray-900" },
            { label: "スーパー管理者", value: String(superAdminCount), tone: "border-indigo-200 bg-indigo-50 text-indigo-900" },
            { label: "通常管理者", value: String(adminCount), tone: "border-blue-200 bg-blue-50 text-blue-900" },
            {
              label: "この画面の操作権",
              value: access.canManageAdmins ? "変更可能" : "閲覧のみ",
              tone: access.canManageAdmins
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900",
            },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border px-4 py-4 ${item.tone}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4">
            <p className="text-sm font-semibold text-indigo-900">スーパー管理者</p>
            <p className="mt-2 text-sm leading-6 text-indigo-900/90">
              投稿の承認作業に加えて、管理者の追加・role 変更・削除まで操作できます。
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
            <p className="text-sm font-semibold text-blue-900">管理者</p>
            <p className="mt-2 text-sm leading-6 text-blue-900/90">
              投稿や通報の管理はできますが、管理者権限の変更はできません。
            </p>
          </div>
        </div>

        {!access.canManageAdmins && (
          <p className="mt-4 text-xs text-amber-700">
            変更操作はスーパー管理者のみ可能です。必要ならスーパー管理者に依頼してください。
          </p>
        )}
        {access.superAdminCount === 0 && (
          <p className="mt-2 text-xs text-amber-700">
            まだスーパー管理者がいないため、現在は通常の管理者でも権限を調整できます。最初に1人をスーパー管理者へ変更してください。
          </p>
        )}
      </section>

      <AdminMembersManager
        members={members}
        currentUserId={auth.user.id}
        canManage={access.canManageAdmins}
        superAdminCount={access.superAdminCount}
      />
    </div>
  );
}
