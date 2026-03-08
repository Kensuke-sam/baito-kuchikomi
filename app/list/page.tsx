import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReviewCard } from "@/components/ReviewCard";
import type { Place, Review } from "@/lib/types";
import { REVIEW_TAGS } from "@/lib/types";

const PER_PAGE = 20;

interface Props {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}

export default async function ListPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const tagFilter = params.tag ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const offset = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  // 勤務先を取得
  const { data: places } = await supabase
    .from("places")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const placeMap = new Map<string, Place>((places ?? []).map((p: Place) => [p.id, p]));

  // 体験談クエリ構築
  let reviewQuery = supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (query) {
    // PostgREST フィルターインジェクション対策: 特殊文字をエスケープ
    const escaped = query
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")
      .replace(/[,().]/g, "");
    reviewQuery = reviewQuery.or(`title.ilike.%${escaped}%,body.ilike.%${escaped}%`);
  }
  if (tagFilter) {
    reviewQuery = reviewQuery.contains("tags", [tagFilter]);
  }

  reviewQuery = reviewQuery.range(offset, offset + PER_PAGE - 1);

  const { data: reviews, count } = await reviewQuery;
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const displayStart = totalCount === 0 ? 0 : offset + 1;
  const displayEnd = totalCount === 0 ? 0 : Math.min(offset + PER_PAGE, totalCount);

  // 検索パラメータを維持するヘルパー
  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (tagFilter) p.set("tag", tagFilter);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    return `/list${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">体験談一覧</h1>
        <Link href="/submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium">
          体験談を投稿
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-800">
        投稿内容はユーザーの主観的な体験談です。事実を保証するものではありません。
      </div>

      {/* 検索・フィルター */}
      <form action="/list" method="GET" className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="キーワードで検索..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            検索
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref({ tag: "", page: "" })}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              !tagFilter
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
            }`}
          >
            すべて
          </Link>
          {REVIEW_TAGS.map((tag) => (
            <Link
              key={tag}
              href={buildHref({ tag: tagFilter === tag ? "" : tag, page: "" })}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                tagFilter === tag
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>
      </form>

      {/* 件数表示 */}
      <p className="text-sm text-gray-500 mb-4">
        {totalCount} 件中 {displayStart}〜{displayEnd} 件を表示
      </p>

      {(reviews ?? []).length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          {query || tagFilter ? "条件に一致する投稿が見つかりません。" : "まだ投稿がありません。"}
        </p>
      ) : (
        <div className="space-y-4">
          {(reviews as Review[]).map((review) => {
            const place = placeMap.get(review.place_id);
            return (
              <div key={review.id}>
                {place && (
                  <Link href={`/places/${place.id}`} className="text-xs text-blue-600 hover:underline mb-1 block">
                    📍 {place.name} — {place.address}
                  </Link>
                )}
                <ReviewCard review={review} placeId={review.place_id} />
              </div>
            );
          })}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={buildHref({ page: String(page - 1) })}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              前へ
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <Link
                  key={p}
                  href={buildHref({ page: String(p) })}
                  className={`px-3 py-1.5 border rounded-md text-sm ${
                    p === page
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </Link>
              )
            )}
          {page < totalPages && (
            <Link
              href={buildHref({ page: String(page + 1) })}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              次へ
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
