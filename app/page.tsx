import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Place } from "@/lib/types";
import { GuideCard } from "@/components/GuideCard";
import { HubCard } from "@/components/HubCard";
import Map from "@/components/Map";
import { getFeaturedGuides } from "@/lib/guides";
import { getAppHubs, getAreaHubs, getJobHubs } from "@/lib/hubs";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: places } = await supabase
    .from("places")
    .select("*")
    .eq("status", "approved");

  const approvedPlaces: Place[] = places ?? [];
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

  return (
    <main className="app-shell px-3 pb-6 pt-3 sm:px-4 sm:pb-8">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className="section-frame p-6 sm:p-8">
          <div>
            <span className="eyebrow">Escape Routes For Part-Time Jobs</span>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-5xl">
              辞めたい気持ちから、次のバイト探しまで。
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--page-muted)] sm:text-base">
              ブラックバイトを避けたい、きつい職場から離れたい、大学生活と両立できる仕事に替えたい。そんな悩みを解決記事と口コミの両方から探せるようにしました。
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {primaryRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="glass-panel rounded-[26px] p-5 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <p className="text-sm font-semibold text-[var(--page-ink)]">{route.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">{route.description}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--accent)]">このルートを見る →</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/guides" className="primary-button text-sm">
              悩み別ガイドを見る
            </Link>
            <Link href="/list" className="secondary-button text-sm">
              口コミ一覧を見る
            </Link>
            <Link href="/submit" className="secondary-button text-sm">
              体験談を投稿
            </Link>
          </div>
        </section>

        <aside className="section-frame flex flex-col gap-4 p-6 sm:p-7">
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              Approved Places
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
              {approvedPlaces.length}
            </p>
            <p className="mt-2 text-sm text-[var(--page-muted)]">
              公開前に管理者確認を通った勤務先だけを掲載しています。
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              Reading Order
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              1. 辞め方を整理
              <br />
              2. 危ない求人の見分け方
              <br />
              3. 次の候補を比較
            </p>
          </div>
          <div className="glass-panel rounded-[28px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">
              使い方の前提
            </p>
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

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="section-frame p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Start Here</span>
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
          <span className="eyebrow">Moderation Flow</span>
          <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
            安全寄りに読むための導線
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--page-muted)]">
            <div className="rounded-[22px] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="font-semibold text-[var(--page-ink)]">主観ベースで掲載</p>
              <p className="mt-2">断定や個人特定表現は避け、体験として読める形に整えています。</p>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="font-semibold text-[var(--page-ink)]">次の仕事探しも一緒に</p>
              <p className="mt-2">悩み記事と口コミをつなぎ、読むだけで止まらない導線にしています。</p>
            </div>
            <div className="rounded-[22px] border border-[var(--line)] bg-white/72 px-4 py-4">
              <p className="font-semibold text-[var(--page-ink)]">削除・訂正導線あり</p>
              <p className="mt-2">問題がある場合は削除申請と当事者コメントの窓口を使えます。</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        <section className="section-frame p-6 sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="eyebrow">Job Type Hubs</span>
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
              <span className="eyebrow">Area Hubs</span>
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
              <span className="eyebrow">Apps & Services</span>
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
        className="mt-6 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]"
        style={{ minHeight: "calc(100vh - 92px)" }}
      >
        <aside className="section-frame flex flex-col gap-6 p-6 sm:p-7">
          <div>
            <span className="eyebrow">Moderated Map</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
              地図から勤務先を深掘りする。
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
              管理者確認を通った勤務先だけを地図に載せています。問題のある職場を避けたいときは、ガイドで基準を見てから地図を読むと比較しやすくなります。
            </p>
          </div>

          <div className="glass-panel rounded-[28px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">読む順番のおすすめ</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--page-muted)]">
              <p>・悩みが強いなら先にガイドを読む</p>
              <p>・候補を比べたいなら地図と一覧へ進む</p>
              <p>・問題があるときは削除申請や通報導線を使う</p>
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
          <div className="glass-panel mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] px-4 py-3 text-sm text-[var(--page-muted)]">
            <div>
              <p className="font-semibold text-[var(--page-ink)]">地図から勤務先を探す</p>
              <p className="text-xs sm:text-sm">ピンを開くと詳細ページへ移動できます。まずガイドで基準を見てから読むと比較しやすいです。</p>
            </div>
            <div className="soft-pill">
              掲載勤務先 {approvedPlaces.length} 件
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-[28px]">
            <Map places={approvedPlaces} />
            <div className="pointer-events-none absolute inset-x-4 top-4 z-10">
              <div className="glass-panel inline-flex max-w-xl rounded-full px-4 py-2 text-xs text-[var(--page-muted)]">
                主観レビューを地図で可視化しています。掲載・削除・当事者コメントはすべて管理者確認後に反映されます。
              </div>
            </div>
            <div className="absolute bottom-5 left-5 z-10">
              <Link href="/list" className="primary-button px-4 py-3 text-sm">
                一覧で深掘りする
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
