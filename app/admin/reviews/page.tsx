import { createAdminClient } from "@/lib/supabase/server";
import { ContentStatusBadge } from "@/components/admin/StatusBadge";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import type { Review } from "@/lib/types";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, places(name, address)")
    .in("status", ["pending", "approved", "rejected"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">体験談キュー</h1>

      {(reviews ?? []).length === 0 ? (
        <p className="text-gray-500">承認待ちの体験談はありません。</p>
      ) : (
        <div className="space-y-4">
          {(reviews as (Review & { places: { name: string; address: string } | null })[]).map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{review.title}</h2>
                  {review.places && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      📍 {review.places.name} — {review.places.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ContentStatusBadge status={review.status} />
                  <span className="text-xs text-gray-400">{review.created_at.slice(0, 10)}</span>
                </div>
              </div>

              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {review.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-700 whitespace-pre-line mb-4">{review.body}</p>

              {review.status === "pending" && (
                <AdminReviewActions id={review.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
