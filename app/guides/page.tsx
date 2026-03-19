import type { Metadata } from "next";
import Link from "next/link";
import { GuideCard } from "@/components/GuideCard";
import { getAllGuides } from "@/lib/guides";
import { getAppHubs, getAreaHubs, getJobHubs } from "@/lib/hubs";
import { HubCard } from "@/components/HubCard";
import { getSiteUrl } from "@/lib/siteUrl";

export function generateMetadata(): Metadata {
  const pageUrl = `${getSiteUrl()}/guides`;
  return {
    title: "バイトの悩みガイド",
    description:
      "辞めたい、きつい、ブラックバイトを見分けたい、単発で逃げたい人向けの実践ガイド一覧です。",
    alternates: { canonical: pageUrl },
    openGraph: {
      title: "バイトの悩みガイド",
      description: "辞めたい、きつい、ブラックバイトを見分けたい、単発で逃げたい人向けの実践ガイド一覧です。",
      url: pageUrl,
      locale: "ja_JP",
      type: "website",
    },
  };
}

export default function GuidesPage() {
  const guides = getAllGuides();
  const jobs = getJobHubs().slice(0, 3);
  const areas = getAreaHubs().slice(0, 3);
  const apps = getAppHubs().slice(0, 3);

  return (
    <main className="app-shell mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">悩み別ガイド</span>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
              辞めたい、きつい、見分けたい。
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
              ブラックバイトを避けたい人、今の職場から抜けたい人、次のバイトを選び直したい人向けに、
              実務で使いやすい順番でガイドをまとめています。
            </p>
          </div>
          <Link href="/list" className="secondary-button text-sm">
            口コミ一覧も見る
          </Link>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              優先度 1
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--page-ink)]">まず困りごとを言語化する</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              辞めたい理由や危険サインが見えると、次の動き方が決まります。
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              優先度 2
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--page-ink)]">今の収入を切らさない</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              単発や次の候補を先に見ておくと、焦って残り続けにくくなります。
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
              優先度 3
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--page-ink)]">危ない求人を避ける</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              高時給だけで選ばず、仕事内容や運用の透明さで比較します。
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
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
            {jobs.map((job) => (
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
            {areas.map((area) => (
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
            {apps.map((app) => (
              <HubCard key={app.slug} hub={app} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
