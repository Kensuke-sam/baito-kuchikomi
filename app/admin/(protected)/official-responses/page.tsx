import { createAdminClient } from "@/lib/supabase/server";
import { ContentStatusBadge } from "@/components/admin/StatusBadge";
import { AdminOfficialResponseActions } from "@/components/admin/AdminOfficialResponseActions";
import type { OfficialResponse } from "@/lib/types";

type OfficialResponseWithPlace = OfficialResponse & {
  places: { name: string; address: string } | null;
};

export default async function AdminOfficialResponsesPage() {
  const supabase = createAdminClient();
  const { data: responses } = await supabase
    .from("official_responses")
    .select("*, places(name, address)")
    .in("status", ["pending", "approved", "rejected"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">当事者コメントキュー</h1>

      {(responses ?? []).length === 0 ? (
        <p className="text-gray-500">承認待ちの当事者コメントはありません。</p>
      ) : (
        <div className="space-y-4">
          {(responses as OfficialResponseWithPlace[]).map((res) => (
            <div key={res.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  {res.places && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      📍 {res.places.name} — {res.places.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ContentStatusBadge status={res.status} />
                  <span className="text-xs text-gray-400">{res.created_at.slice(0, 10)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-line mb-4">{res.body}</p>

              {res.status === "pending" && (
                <AdminOfficialResponseActions id={res.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
