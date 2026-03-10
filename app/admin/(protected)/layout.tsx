import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAuthResult } from "@/lib/adminAuth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAdminAuthResult();
  if (!auth.user) redirect("/admin/login");
  if (!auth.isAdmin) redirect("/");

  const user = auth.user;
  const roleLabel = auth.role === "super_admin" ? "SUPER ADMIN" : "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-bold text-base">🔧 管理画面</span>
        <Link href="/admin" className="hover:text-gray-300">ダッシュボード</Link>
        <Link href="/admin/reviews" className="hover:text-gray-300">体験談キュー</Link>
        <Link href="/admin/places" className="hover:text-gray-300">勤務先キュー</Link>
        <Link href="/admin/admins" className="hover:text-gray-300">管理者権限</Link>
        <Link href="/admin/official-responses" className="hover:text-gray-300">当事者コメント</Link>
        <Link href="/admin/reports" className="hover:text-gray-300">通報</Link>
        <Link href="/admin/takedowns" className="hover:text-gray-300">削除申請</Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full bg-gray-700 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-gray-200">
            {roleLabel}
          </span>
          <span className="text-gray-400 text-xs">{user.email}</span>
          <form action="/api/admin/signout" method="POST">
            <button className="text-gray-400 hover:text-white text-xs">ログアウト</button>
          </form>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
