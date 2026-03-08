import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

async function getCount(table: string, status: string) {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  return count ?? 0;
}

export default async function AdminDashboard() {
  const [pendingReviews, pendingPlaces, pendingOfficialResponses, openReports, openTakedowns] = await Promise.all([
    getCount("reviews", "pending"),
    getCount("places", "pending"),
    getCount("official_responses", "pending"),
    getCount("reports", "received"),
    getCount("takedown_requests", "received"),
  ]);

  const cards = [
    { label: "承認待ち体験談",  count: pendingReviews,  href: "/admin/reviews",   color: "bg-yellow-50 border-yellow-200" },
    { label: "承認待ち勤務先",  count: pendingPlaces,   href: "/admin/places",    color: "bg-blue-50 border-blue-200" },
    { label: "承認待ち当事者コメント", count: pendingOfficialResponses, href: "/admin/official-responses", color: "bg-indigo-50 border-indigo-200" },
    { label: "未対応の通報",    count: openReports,     href: "/admin/reports",   color: "bg-orange-50 border-orange-200" },
    { label: "未対応の削除申請", count: openTakedowns,  href: "/admin/takedowns", color: "bg-red-50 border-red-200" },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${card.color}`}
          >
            <p className="text-3xl font-bold text-gray-900">{card.count}</p>
            <p className="text-sm text-gray-600 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
        <p className="font-semibold mb-1">運用の注意事項</p>
        <ul className="list-disc list-inside space-y-0.5 text-xs">
          <li>体験談・勤務先は手動で確認してから承認してください。</li>
          <li>削除申請は5営業日以内に対応することを目安にしてください。</li>
          <li>承認/却下操作はすべて監査ログに記録されます。</li>
        </ul>
      </div>
    </div>
  );
}
