import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Place } from "@/lib/types";
import { FirstReviewCallout } from "@/components/FirstReviewCallout";
import { GuideCard } from "@/components/GuideCard";
import { HubCard } from "@/components/HubCard";
import Map from "@/components/Map";
import { getFeaturedGuides } from "@/lib/guides";
import { getAppHubs, getAreaHubs, getJobHubs } from "@/lib/hubs";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: places }, { count: approvedReviewCount }] = await Promise.all([
    supabase.from("places").select("*").eq("status", "approved"),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
  ]);

  const approvedPlaces: Place[] = places ?? [];
  const approvedReviews = approvedReviewCount ?? 0;
  const isZeroReviewLaunch = approvedReviews === 0;
  const featuredGuides = getFeaturedGuides();
  const featuredJobs = getJobHubs().slice(0, 3);
  const featuredAreas = getAreaHubs().slice(0, 3);
  const featuredApps = getAppHubs().slice(0, 3);
  const primaryRoutes = [
    {
      title: "今のバイトを辞めたい",
      description: "角が立ちにくい伝え方と、辞める前に決める順番を整理する",
      href: "/guides/baito-yametai-daigakusei",
    },
    {
      title: "単発でひとまず逃がしたい",
      description: "今週の生活費をつなぎやすい短期の考え方を見る",
      href: "/guides/tanpatsu-baito-app-hikaku",
    },
    {
      title: "ブラックバイトを避けたい",
      description: "危ない求人のサインを先にチェックして次の失敗を減らす",
      href: "/guides/black-baito-miwakekata",
    },
    {
      title: "口コミから候補を絞りたい",
      description: "勤務先ごとの主観レビューを見ながら次の候補を比較する",
      href: "/list",
    },
  ];
  const recordStats = [
    {
      label: "掲載済み勤務先",
      value: String(approvedPlaces.length),
      note:
        approvedPlaces.length > 0
          ? "管理者確認を通った勤務先だけを地図に反映"
          : "最初の勤務先投稿を受付中",
    },
    {
      label: "公開済み体験談",
      value: String(approvedReviews),
      note:
        approvedReviews > 0
          ? "公開後は一覧と勤務先ページの両方に表示"
          : "まだ公開 0 件。最初の投稿を募集中",
    },
    {
      label: "対応窓口",
      value: "3",
      note: "通報 / 削除申請 / 当事者コメント",
    },
  ];
  const mapReadingNotes = [
    "ピンは管理者確認を通った勤務先だけを表示",
    "詳細ページでは体験談の本文と投稿時期を確認",
    "問題がある場合は通報・削除申請・当事者コメントへ",
  ];

  return (
    <main className="app-shell px-3 pb-6 pt-3 sm:px-4 sm:pb-8">
      {/* ── モバイル: マップヒーロー ── */}
      <section className="mobile-map-hero">
        <Map places={approvedPlaces} />
        <div className="mobile-map-fade" />
        <div className="mobile-map-overlay">
          <div className="px-4 pb-6">
            <div className="notice-strip mb-3">
              <span className="notice-strip__label">掲載前提</span>
              <p className="text-xs leading-6 text-[var(--page-ink)]">
                {approvedPlaces.length > 0
                  ? `掲載 ${approvedPlaces.length} 件 / 体験談 ${approvedReviews} 件。主観レビューを管理者確認後に公開しています。`
                  : "投稿受付中。主観レビューを管理者確認後に公開します。"}
              </p>
            </div>
            <div className="glass-panel mb-3 rounded-[18px] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--page-muted)]">
                    掲載地図を確認
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--page-ink)]">地図から勤務先を探す</p>
                  <p className="text-xs text-[var(--page-muted)] mt-0.5">
                    {approvedPlaces.length > 0
                      ? "ピンを開くと勤務先詳細へ移動できます"
                      : "最初の勤務先と体験談の投稿を募集しています"}
                  </p>
                </div>
                <Link href={approvedPlaces.length > 0 ? "/list" : "/submit"} className="primary-button px-4 py-2 text-xs whitespace-nowrap">
                  {approvedPlaces.length > 0 ? "一覧で確認" : "投稿する"}
                </Link>
              </div>
            </div>
            <p className="text-center text-xs text-[var(--page-muted)] opacity-80">↓ 下へスクロールして読み方とガイドを見る</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="section-frame p-6 sm:p-8">
          <div>
            <span className="eyebrow">掲載地図と体験談</span>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-5xl">
              避けたい勤務先を、地図と体験談で先に確認する。
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--page-muted)] sm:text-base">
              働き始めてから気づきやすいシフト、人間関係、研修、辞めやすさを、主観レビューと実践ガイドの両方から読めるようにしています。求人票だけでは見えにくい実感を、先に比較するための入口です。
            </p>
            {isZeroReviewLaunch && (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--accent)]">
                いまは公開済みの体験談が 0 件です。匿名で投稿でき、公開前に内容を確認したうえで掲載します。
              </p>
            )}
          </div>

          <div className="notice-strip mt-6">
            <span className="notice-strip__label">閲覧前の前提</span>
            <p className="text-sm leading-6 text-[var(--page-ink)]">
              掲載内容は主観レビューです。断定情報ではなく、勤務先選びの比較材料として読める形に整えています。
            </p>
          </div>

          <div className="record-grid mt-6 md:grid-cols-3">
            {recordStats.map((stat) => (
              <div key={stat.label} className="record-card">
                <p className="record-card__label">{stat.label}</p>
                <p className="record-card__value">{stat.value}</p>
                <p className="record-card__note">{stat.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {primaryRoutes.map((route, index) => (
              <Link
                key={route.href}
                href={route.href}
                className="glass-panel rounded-[20px] border-l-4 border-l-[var(--marker-fill)] p-5 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="soft-pill">ROUTE {String(index + 1).padStart(2, "0")}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--page-muted)]">
                    悩み別
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--page-ink)]">{route.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">{route.description}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--accent)]">このルートを見る →</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={isZeroReviewLaunch ? "/submit" : "/guides"} className="primary-button text-sm">
              {isZeroReviewLaunch ? "最初の体験談を投稿する" : "悩み別ガイドを見る"}
            </Link>
            <Link href={isZeroReviewLaunch ? "/guides" : "/list"} className="secondary-button text-sm">
              {isZeroReviewLaunch ? "悩み別ガイドを見る" : "口コミ一覧を見る"}
            </Link>
            <Link href="/submit" className="secondary-button text-sm">
              {isZeroReviewLaunch ? "勤務先と体験談を投稿" : "体験談を投稿"}
            </Link>
          </div>
        </section>

        <aside className="section-frame flex flex-col gap-4 p-6 sm:p-7">
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              掲載台帳
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
              {approvedPlaces.length}
            </p>
            <p className="mt-2 text-sm text-[var(--page-muted)]">
              {approvedPlaces.length > 0
                ? "承認済みの勤務先だけを地図と一覧に表示しています。"
                : "まだ表示中の勤務先はありません。最初の登録を受け付けています。"}
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              公開済みの体験談
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
              {approvedReviews}
            </p>
            <p className="mt-2 text-sm text-[var(--page-muted)]">
              {isZeroReviewLaunch
                ? "まだ体験談はありません。最初の投稿を受け付けています。"
                : "公開済みの体験談だけを一覧と勤務先ページに反映しています。"}
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              地図の読み方
            </p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--page-muted)]">
              {mapReadingNotes.map((note) => (
                <p key={note}>・{note}</p>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[28px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">使い方の前提</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              掲載情報は主観レビューです。事実の断定ではなく、働いた人の体験傾向を読むために使ってください。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/editorial-policy" className="secondary-button px-4 py-2 text-sm">
                編集方針
              </Link>
              <Link href="/guidelines" className="secondary-button px-4 py-2 text-sm">
                投稿ガイドライン
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {isZeroReviewLaunch && (
        <section className="mt-6">
          <FirstReviewCallout
            eyebrow="最初の体験談募集"
            title="まだ公開済みの体験談はありません。最初の投稿を募集しています。"
            description="このサイトで働き方の実感が伝わるように、最初の体験談を受け付けています。匿名で投稿でき、公開前に内容を確認します。シフトや人間関係、研修の様子など、短い実体験でも次の人の参考になります。"
            highlights={[
              {
                title: "匿名で送信",
                body: "公開ページには個人情報を出さず、投稿は主観レビューとして扱います。",
              },
              {
                title: "勤務先登録も同時に完了",
                body: "勤務先が未登録でも、そのまま住所確認から投稿までまとめて進められます。",
              },
              {
                title: "細かい暴露より具体例",
                body: "シフト、人間関係、研修、辞めやすさだけでも次の人の判断材料になります。",
              },
            ]}
            primaryHref="/submit"
            primaryLabel="最初の体験談を投稿する"
            secondaryHref="/guidelines"
            secondaryLabel="投稿ガイドライン"
            footnote="まだ公開済みの体験談がないことを明示したまま、実際に働いた人の投稿を受け付けています。"
          />
        </section>
      )}

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="section-frame p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">まずはここから</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-3xl">
                最初に読むべき3本
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--page-muted)]">
                口コミがまだ少ない時期でも、悩み検索から入りやすい記事を先に置いています。
              </p>
            </div>
            <Link href="/guides" className="secondary-button text-sm">
              ガイド一覧へ
            </Link>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {featuredGuides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </section>

        <aside className="section-frame p-6 sm:p-7">
          <span className="eyebrow">安心して使うために</span>
          <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
            口コミを読む前に知っておきたいこと
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--page-muted)]">
            <div className="rounded-[22px] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="font-semibold text-[var(--page-ink)]">主観ベースで掲載</p>
              <p className="mt-2">断定や個人特定表現は避け、体験として読める形に整えています。</p>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="font-semibold text-[var(--page-ink)]">次の候補も探しやすい</p>
              <p className="mt-2">ガイドと口コミを行き来しながら、自分に合う働き方を探せます。</p>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="font-semibold text-[var(--page-ink)]">削除・訂正の窓口あり</p>
              <p className="mt-2">問題がある場合は削除申請フォームや当事者コメントフォームを利用できます。</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="section-frame p-6 sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="eyebrow">職種ハブ</span>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                職種から探す
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
                地域から探す
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
                単発・求人サービス比較
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

      <section
        className="mt-6 hidden gap-4 lg:grid lg:grid-cols-[340px_minmax(0,1fr)]"
        style={{ minHeight: "calc(100vh - 92px)" }}
      >
        <aside className="section-frame flex flex-col gap-6 p-6 sm:p-7">
          <div>
            <span className="eyebrow">掲載地図</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
              承認済みの勤務先だけを、地図で確認する。
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
              管理者確認を通った勤務先だけを地図に載せています。主観レビューを読んで比較したいときは、一覧と勤務先詳細を行き来しながら確認するのが最短です。
            </p>
          </div>

          <div className="notice-strip">
            <span className="notice-strip__label">表示基準</span>
            <p className="text-sm leading-6 text-[var(--page-ink)]">
              掲載は主観レビューです。問題がある場合は削除申請フォームと当事者コメントフォームを利用できます。
            </p>
          </div>

          <div className="glass-panel rounded-[22px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">読む順番のおすすめ</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--page-muted)]">
              <p>・悩みが強いなら先にガイドを読む</p>
              <p>・候補を比べたいなら地図と一覧へ進む</p>
              <p>・問題があるときは各窓口から連絡する</p>
            </div>
          </div>

          <div className="glass-panel rounded-[22px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">地図を読むときの確認点</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--page-muted)]">
              {mapReadingNotes.map((note) => (
                <p key={note}>・{note}</p>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-3">
            <Link href="/guides" className="primary-button text-sm">
              ガイドから始める
            </Link>
            <Link href="/list" className="secondary-button text-sm">
              一覧で見る
            </Link>
          </div>
        </aside>

        <section className="section-frame map-frame flex min-h-[540px] flex-col p-3 sm:p-4">
          <div className="glass-panel mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-sm text-[var(--page-muted)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--page-muted)]">
                掲載状況
              </p>
              <p className="mt-1 font-semibold text-[var(--page-ink)]">地図から勤務先を探す</p>
              <p className="text-xs sm:text-sm">
                {approvedPlaces.length > 0
                  ? "ピンを開くと詳細ページへ移動できます。必要なら一覧ページで並べて比較できます。"
                  : "まだ地図に表示できる勤務先がありません。最初の勤務先と体験談が公開されると、ここにピンが出ます。"}
              </p>
            </div>
            <div className="soft-pill">
              {approvedPlaces.length > 0 ? `掲載勤務先 ${approvedPlaces.length} 件` : "投稿受付中"}
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-[28px]">
            <Map places={approvedPlaces} />
            <div className="pointer-events-none absolute left-4 top-4 z-10">
              <div className="glass-panel inline-flex items-center gap-2 rounded-[16px] px-3 py-2 text-xs text-[var(--page-muted)]">
                <span className="inline-flex h-3 w-3 rounded-full bg-[var(--marker-fill)] ring-2 ring-[#fff2b0]" />
                {approvedPlaces.length > 0 ? "承認済みの勤務先を表示中" : "公開待ちのため表示なし"}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-4 top-20 z-10">
              <div className="notice-strip inline-flex max-w-2xl">
                <span className="notice-strip__label">補足</span>
                <p className="text-xs leading-6 text-[var(--page-ink)]">
                  {approvedPlaces.length > 0
                    ? "掲載・削除・当事者コメントはすべて管理者確認後に反映されます。"
                    : "公開済みの勤務先はまだありません。最初の勤務先と体験談の投稿を受け付けています。"}
                </p>
              </div>
            </div>
            <div className="absolute bottom-5 left-5 z-10">
              <Link href={approvedPlaces.length > 0 ? "/list" : "/submit"} className="primary-button px-4 py-3 text-sm">
                {approvedPlaces.length > 0 ? "一覧で深掘りする" : "勤務先と体験談を投稿する"}
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
