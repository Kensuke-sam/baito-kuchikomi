import { createAdminClient } from "@/lib/supabase/server";
import { RequestStatusBadge } from "@/components/admin/StatusBadge";
import { AdminRequestActions } from "@/components/admin/AdminRequestActions";
import type { TakedownRequest } from "@/lib/types";

export default async function AdminTakedownsPage() {
  const supabase = createAdminClient();
  const { data: takedowns } = await supabase
    .from("takedown_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">削除申請一覧</h1>

      {(takedowns ?? []).length === 0 ? (
        <p className="text-gray-500">削除申請はありません。</p>
      ) : (
        <div className="space-y-4">
          {(takedowns as TakedownRequest[]).map((td) => (
            <div key={td.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{td.reason}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    申請者: {td.contact_name} / {td.contact_email}
                  </p>
                  <p className="text-xs text-blue-600 break-all">対象URL: {td.target_url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RequestStatusBadge status={td.status} />
                  <span className="text-xs text-gray-400">{td.created_at.slice(0, 10)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-2">{td.detail}</p>
              {td.evidence_url && (
                <a href={td.evidence_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline">
                  証拠資料を見る
                </a>
              )}
              {td.admin_notes && (
                <p className="text-xs text-blue-700 mt-2">📝 管理者メモ: {td.admin_notes}</p>
              )}

              <div className="mt-3">
                <AdminRequestActions
                  id={td.id}
                  type="takedowns"
                  currentStatus={td.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
