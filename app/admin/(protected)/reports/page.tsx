import { createAdminClient } from "@/lib/supabase/server";
import { RequestStatusBadge } from "@/components/admin/StatusBadge";
import { AdminRequestActions } from "@/components/admin/AdminRequestActions";
import type { Report } from "@/lib/types";

export default async function AdminReportsPage() {
  const supabase = createAdminClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">通報一覧</h1>

      {(reports ?? []).length === 0 ? (
        <p className="text-gray-500">通報はありません。</p>
      ) : (
        <div className="space-y-3">
          {(reports as Report[]).map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium text-sm text-gray-900">{report.reason}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    対象: {report.target_type} / {report.target_id}
                  </p>
                  {report.detail && (
                    <p className="text-xs text-gray-700 mt-1">{report.detail}</p>
                  )}
                  {report.admin_notes && (
                    <p className="text-xs text-blue-700 mt-1">📝 管理者メモ: {report.admin_notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RequestStatusBadge status={report.status} />
                  <span className="text-xs text-gray-400">{report.created_at.slice(0, 10)}</span>
                </div>
              </div>
              <AdminRequestActions
                id={report.id}
                type="reports"
                currentStatus={report.status}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
