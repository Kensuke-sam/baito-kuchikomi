import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FirstReviewCallout } from "@/components/FirstReviewCallout";
import { HubCard } from "@/components/HubCard";
import { ReviewCard } from "@/components/ReviewCard";
import { getFeaturedGuides } from "@/lib/guides";
import { getAppHubs, getAreaHubs, getJobHubs } from "@/lib/hubs";
import type { Place, Review, OfficialResponse } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: place } = await supabase
    .from("places")
    .select("name, address")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!place) return { title: "勤務先が見つかりません" };

  return {
    title: `${place.name} の体験談 | バイト体験談マップ`,
    description: `${place.name}（${place.address}）のアルバイト体験談・口コミ一覧`,
  };
}

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const featuredGuides = getFeaturedGuides();
  const featuredJobs = getJobHubs().slice(0, 3);
  const featuredAreas = getAreaHubs().slice(0, 3);
  const featuredApps = getAppHubs().slice(0, 3);

  const [
    { data: place },
    { data: reviews },
    { data: responses },
  ] = await Promise.all([
    supabase.from("places").select("*").eq("id", id).eq("status", "approved").single(),
    supabase.from("reviews").select("*").eq("place_id", id).eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("official_responses").select("*").eq("place_id", id).eq("status", "approved").order("created_at", { ascending: false }),
  ]);

  if (!place) return notFound();

  const p: Place = place;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* 勤務先情報 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h1>
        <p className="text-sm text-gray-500">📍 {p.address}</p>
        {p.nearest_station && (
          <p className="text-sm text-gray-500">🚉 最寄り駅: {p.nearest_station}</p>
        )}
        <div className="mt-3 flex gap-3">
          <Link
            href={`/submit?place_id=${p.id}`}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium"
          >
            この勤務先の体験談を投稿
          </Link>
          <a
            href={`/report?type=place&id=${p.id}`}
            className="text-sm text-gray-500 hover:text-red-500 px-2 py-1.5"
          >
            この勤務先を通報
          </a>
        </div>
      </div>

      {/* 免責 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-800">
        投稿内容の正確性は保証しません。削除申請・訂正は
        <Link href="/takedown" className="underline ml-1">こちら</Link>
        から。
      </div>

      {/* 当事者コメント */}
      {(responses ?? []).length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">当事者・企業からのコメント</h2>
          {(responses as OfficialResponse[]).map((res) => (
            <div key={res.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
              <p className="text-xs text-blue-700 font-semibold mb-1">【当事者コメント】</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{res.body}</p>
              <p className="text-xs text-gray-400 mt-1">{res.created_at.slice(0, 10)}</p>
            </div>
          ))}
        </section>
      )}

      {/* 体験談一覧 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-4">
          体験談 ({(reviews ?? []).length} 件)
        </h2>
        {(reviews ?? []).length === 0 ? (
          <FirstReviewCallout
            eyebrow="最初の体験談募集"
            title="この勤務先の公開済み体験談はまだありません。"
            description="この職場で働いたことがある方の体験談を募集しています。匿名で投稿でき、公開前に内容を確認します。"
            highlights={[
              {
                title: "シフトの実感",
                body: "入りやすさ、急な変更、テスト期間との両立など、実際の回し方が分かると助かります。",
              },
              {
                title: "人間関係と教育",
                body: "教え方、忙しい時間帯の雰囲気、質問しやすさは短い文章でも伝わります。",
              },
              {
                title: "辞めやすさや負担感",
                body: "きつかった点と辞めやすさは、次に応募する人の判断材料になりやすいです。",
              },
            ]}
            primaryHref={`/submit?place_id=${p.id}`}
            primaryLabel="この勤務先の体験談を投稿"
            secondaryHref="/guidelines"
            secondaryLabel="投稿ガイドライン"
            footnote="投稿は匿名で送信でき、公開前に管理者が確認します。"
          />
        ) : (
          <div className="space-y-4">
            {(reviews as Review[]).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">関連ガイド</p>
        <h2 className="mt-3 text-lg font-bold text-gray-900">次の候補を探す前に読みたい記事</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featuredGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 hover:border-blue-300"
            >
              <p className="text-xs font-semibold text-blue-600">{guide.category}</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{guide.title}</p>
              <p className="mt-2 text-xs leading-6 text-gray-500">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        <section className="section-frame p-6 sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="eyebrow">職種ハブ</span>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                職種から比較
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
                地域から比較
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

      {/* 当事者コメント投稿誘導 */}
      <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm text-gray-600">
        <p className="font-semibold mb-1">この勤務先の当事者・企業の方へ</p>
        <p className="text-xs mb-2">投稿内容への反論・訂正をコメントとして掲載できます（管理者確認後）。</p>
        <Link
          href={`/official-response?place_id=${p.id}`}
          className="text-blue-600 hover:underline text-xs"
        >
          当事者コメントを送る →
        </Link>
      </div>
    </main>
  );
}
