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

  // 勤務先を取得（一覧表示に必要なカラムのみ）
  const { data: places } = await supabase
    .from("places")
    .select("id, name, address")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  type PlaceSummary = Pick<Place, "id" | "name" | "address">;
  const placeMap = new Map<string, PlaceSummary>((places ?? []).map((p: PlaceSummary) => [p.id, p]));

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
    <main className="app-shell mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <section className="section-frame p-5 sm:p-7">
        <div className="flex flex-col gap-5 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="eyebrow">Search Stories</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
              体験談一覧
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--page-muted)]">
              キーワードとタグで絞り込みながら、承認済みの体験談を横断できます。掲載内容は主観レビューです。
            </p>
          </div>
          <Link href="/submit" className="primary-button text-sm">
            体験談を投稿
          </Link>
        </div>

        <div className="glass-panel mt-6 rounded-[28px] p-5 text-sm text-[var(--page-muted)]">
          投稿内容はユーザーの主観的な体験談であり、事実を保証するものではありません。
        </div>

        <form action="/list" method="GET" className="glass-panel mt-6 rounded-[28px] p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="勤務先名・体験内容・気になる言葉で検索"
              className="field-input flex-1 text-sm text-[var(--page-ink)] placeholder:text-gray-400"
            />
            <button type="submit" className="primary-button text-sm">
              検索
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={buildHref({ tag: "", page: "" })} className="soft-pill" data-active={!tagFilter}>
              すべて
            </Link>
            {REVIEW_TAGS.map((tag) => (
              <Link
                key={tag}
                href={buildHref({ tag: tagFilter === tag ? "" : tag, page: "" })}
                className="soft-pill"
                data-active={tagFilter === tag}
              >
                {tag}
              </Link>
            ))}
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--page-muted)]">
          <p>
            {totalCount} 件中 {displayStart}〜{displayEnd} 件を表示
          </p>
          <div className="soft-pill">
            {query || tagFilter ? "絞り込み中" : "全件表示"}
          </div>
        </div>

        {(reviews ?? []).length === 0 ? (
          <div className="glass-panel mt-6 rounded-[28px] px-6 py-14 text-center text-[var(--page-muted)]">
            {query || tagFilter ? "条件に一致する投稿が見つかりません。" : "まだ投稿がありません。"}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {(reviews as Review[]).map((review) => {
              const place = placeMap.get(review.place_id);
              return (
                <div key={review.id}>
                  {place && (
                    <Link
                      href={`/places/${place.id}`}
                      className="mb-2 inline-flex text-xs font-semibold text-[var(--accent)] hover:opacity-80"
                    >
                      📍 {place.name} — {place.address}
                    </Link>
                  )}
                  <ReviewCard review={review} placeId={review.place_id} />
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link href={buildHref({ page: String(page - 1) })} className="secondary-button px-4 py-3 text-sm">
                前へ
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-[var(--page-muted)]">
                    ...
                  </span>
                ) : (
                  <Link
                    key={p}
                    href={buildHref({ page: String(p) })}
                    className="soft-pill min-w-10"
                    data-active={p === page}
                  >
                    {p}
                  </Link>
                )
              )}
            {page < totalPages && (
              <Link href={buildHref({ page: String(page + 1) })} className="secondary-button px-4 py-3 text-sm">
                次へ
              </Link>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
