import type { Metadata } from "next";
import Link from "next/link";
import { HubCard } from "@/components/HubCard";
import { createClient } from "@/lib/supabase/server";
import { GuideCard } from "@/components/GuideCard";
import { GuideCta } from "@/components/GuideCta";
import { FirstReviewCallout } from "@/components/FirstReviewCallout";
import { ReviewCard } from "@/components/ReviewCard";
import { getFeaturedGuides } from "@/lib/guides";
import { getAppHubs, getAreaHubs, getJobHubs } from "@/lib/hubs";
import type { Place, Review } from "@/lib/types";
import { REVIEW_TAGS } from "@/lib/types";

export const metadata: Metadata = {
  title: "体験談一覧",
  description: "勤務先名・住所・タグで承認済みのバイト体験談を横断検索できる一覧ページです。",
};

const PER_PAGE = 20;

function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeLikePattern(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/[,().]/g, "");
}

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
  const normalizedQuery = normalizeSearchText(query);
  const matchingPlaceIds = normalizedQuery
    ? (places ?? [])
        .filter((place: PlaceSummary) =>
          normalizeSearchText(`${place.name} ${place.address}`).includes(normalizedQuery)
        )
        .map((place: PlaceSummary) => place.id)
    : [];

  // 体験談クエリ構築
  let reviewQuery = supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (query) {
    const escaped = escapeLikePattern(query);
    const filters = [`title.ilike.%${escaped}%`, `body.ilike.%${escaped}%`];

    if (matchingPlaceIds.length > 0) {
      filters.push(`place_id.in.(${matchingPlaceIds.map((id) => `"${id}"`).join(",")})`);
    }

    reviewQuery = reviewQuery.or(filters.join(","));
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
  const isLaunchEmptyState = totalCount === 0 && !query && !tagFilter;
  const featuredGuides = getFeaturedGuides();
  const featuredJobs = getJobHubs().slice(0, 3);
  const featuredAreas = getAreaHubs().slice(0, 3);
  const featuredApps = getAppHubs().slice(0, 3);

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
            <span className="eyebrow">体験談を探す</span>
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

        <div className="mt-6">
          <GuideCta
            eyebrow="読む前の基準"
            title="口コミの前に、危ない求人の見分け方も持っておく"
            description="一覧は便利ですが、読み方の基準がないと判断しにくくなります。先にガイドを1本読むと、口コミから拾うポイントがはっきりします。"
            trackingContext="list:search-context"
            primary={{
              label: "ブラックバイトの見分け方を読む",
              href: "/guides/black-baito-miwakekata",
              description: "危ないサインを先に押さえてから一覧へ戻る",
            }}
            secondary={{
              label: "単発バイト比較を読む",
              href: "/guides/tanpatsu-baito-app-hikaku",
              description: "今の職場を離れたいときの逃げ先を先に持つ",
            }}
          />
        </div>

        <form action="/list" method="GET" className="glass-panel mt-6 rounded-[28px] p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="勤務先名・住所・体験内容・気になる言葉で検索"
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
          isLaunchEmptyState ? (
            <div className="mt-6 space-y-6">
              <FirstReviewCallout
                eyebrow="最初の体験談募集"
                title="この一覧はまだ空です。だから今は、最初の投稿を集める面に変えます。"
                description="投稿が0件のままでは、口コミ一覧が比較材料として機能しません。偽の口コミで埋めず、公開0件であることを明示したうえで、最初の実体験を安心して送れる導線を前面に出します。"
                highlights={[
                  {
                    title: "匿名で投稿できる",
                    body: "公開ページには個人情報を出さず、内容は主観レビューとして掲載します。",
                  },
                  {
                    title: "勤務先登録までこの画面で完了",
                    body: "まだ載っていない勤務先でも、そのまま住所確認から投稿まで進められます。",
                  },
                  {
                    title: "短くても具体例が効く",
                    body: "シフト、給与、人間関係、研修、辞めやすさのどれか1つでも次の人の役に立ちます。",
                  },
                ]}
                primaryHref="/submit"
                primaryLabel="最初の体験談を投稿する"
                secondaryHref="/guidelines"
                secondaryLabel="投稿ガイドライン"
                footnote="立ち上げ期は、一覧そのものより『安心して最初の1件を投稿できるか』のほうが重要です。"
              />

              <section className="section-frame p-6 sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="eyebrow">先に読む</span>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
                      先に読むと、どんな体験談を書くべきか整理しやすい記事
                    </h2>
                  </div>
                  <Link href="/guides" className="secondary-button text-sm">
                    ガイド一覧へ
                  </Link>
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {featuredGuides.map((guide) => (
                    <GuideCard key={guide.slug} guide={guide} />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="glass-panel mt-6 rounded-[28px] px-6 py-14 text-center text-[var(--page-muted)]">
              <p>条件に一致する投稿が見つかりません。</p>
              <p className="mt-3 text-sm leading-7">
                キーワードを広げるか、タグを外して探し直してください。先に悩み別ガイドを見ると、どんな観点で探すか整理しやすくなります。
              </p>
              <div className="mt-6 grid gap-4 text-left lg:grid-cols-3">
                {featuredGuides.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </div>
          )
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

        {(reviews ?? []).length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="eyebrow">関連ガイド</span>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
                  読みながら次の動きも決める
                </h2>
              </div>
              <Link href="/guides" className="secondary-button text-sm">
                ガイド一覧へ
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {featuredGuides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-4 xl:grid-cols-3">
          <section className="section-frame p-6 sm:p-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="eyebrow">職種ハブ</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                  職種から絞る
                </h2>
              </div>
              <Link href="/jobs" className="secondary-button text-sm">
                すべて
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {featuredJobs.map((job) => (
                <HubCard key={job.slug} hub={job} />
              ))}
            </div>
          </section>

          <section className="section-frame p-6 sm:p-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="eyebrow">地域ハブ</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                  地域から絞る
                </h2>
              </div>
              <Link href="/areas" className="secondary-button text-sm">
                すべて
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {featuredAreas.map((area) => (
                <HubCard key={area.slug} hub={area} />
              ))}
            </div>
          </section>

          <section className="section-frame p-6 sm:p-7">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="eyebrow">アプリ・サービス</span>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                  サービス比較
                </h2>
              </div>
              <Link href="/apps" className="secondary-button text-sm">
                すべて
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {featuredApps.map((app) => (
                <HubCard key={app.slug} hub={app} />
              ))}
            </div>
          </section>
        </section>

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
