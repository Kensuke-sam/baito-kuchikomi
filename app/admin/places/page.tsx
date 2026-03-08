import { createAdminClient } from "@/lib/supabase/server";
import { ContentStatusBadge } from "@/components/admin/StatusBadge";
import { AdminPlaceActions } from "@/components/admin/AdminPlaceActions";
import type { Place } from "@/lib/types";

export default async function AdminPlacesPage() {
  const supabase = createAdminClient();
  const { data: places } = await supabase
    .from("places")
    .select("*")
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">勤務先キュー</h1>

      {(places ?? []).length === 0 ? (
        <p className="text-gray-500">承認待ちの勤務先はありません。</p>
      ) : (
        <div className="space-y-3">
          {(places as Place[]).map((place) => (
            <div key={place.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-semibold text-gray-900">{place.name}</h2>
                  <p className="text-xs text-gray-500">📍 {place.address}</p>
                  {place.nearest_station && (
                    <p className="text-xs text-gray-400">🚉 {place.nearest_station}</p>
                  )}
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    ({place.lat.toFixed(5)}, {place.lng.toFixed(5)})
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ContentStatusBadge status={place.status} />
                  <span className="text-xs text-gray-400">{place.created_at.slice(0, 10)}</span>
                </div>
              </div>

              {place.status === "pending" && (
                <AdminPlaceActions id={place.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
