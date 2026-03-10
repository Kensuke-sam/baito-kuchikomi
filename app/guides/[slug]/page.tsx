import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionSpotlight } from "@/components/ActionSpotlight";
import { GuideCard } from "@/components/GuideCard";
import { HubCard } from "@/components/HubCard";
import { PromotionNotice } from "@/components/PromotionNotice";
import {
  getAllGuides,
  getGuideBySlug,
  getRelatedGuides,
  resolveGuideAction,
} from "@/lib/guides";
import { getAppHubs, getAreaHubs, getJobHubs } from "@/lib/hubs";
import { isExternalHref } from "@/lib/partnerLinks";
import { getSiteUrl } from "@/lib/siteUrl";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "記事が見つかりません",
    };
  }

  return {
    title: guide.title,
    description: guide.description,
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/guides/${guide.slug}`;
  const primaryAction = resolveGuideAction(guide.primaryAction);
  const secondaryAction = resolveGuideAction(guide.secondaryAction);
  const hasSponsoredLink = isExternalHref(primaryAction.href) || isExternalHref(secondaryAction.href);
  const relatedGuides = getRelatedGuides(guide.relatedSlugs);
  const relatedJobs = getJobHubs().slice(0, 3);
  const relatedAreas = getAreaHubs().slice(0, 3);
  const relatedApps = getAppHubs().slice(0, 3);

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: "ja",
    mainEntityOfPage: articleUrl,
    author: {
      "@type": "Organization",
      name: "バイト体験談マップ",
    },
    publisher: {
      "@type": "Organization",
      name: "バイト体験談マップ",
    },
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "バイトの悩みガイド",
        item: `${siteUrl}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <main className="app-shell mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--page-muted)]">
        <Link href="/" className="hover:text-[var(--page-ink)]">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-[var(--page-ink)]">
          バイトの悩みガイド
        </Link>
        <span>/</span>
        <span>{guide.category}</span>
      </nav>

      <article className="section-frame p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="soft-pill" data-active>
              {guide.category}
            </span>
            <span className="soft-pill">{guide.readingTime}</span>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
            {guide.description}
          </p>
          <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-white/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
              Key Points
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-7 text-[var(--page-muted)]">
              {guide.keyPoints.map((point) => (
                <li key={point}>・{point}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          {hasSponsoredLink && (
            <PromotionNotice className="mb-4" />
          )}
          <ActionSpotlight
            eyebrow={primaryAction.eyebrow}
            title={primaryAction.title}
            body={primaryAction.body}
            href={primaryAction.href}
            label={primaryAction.label}
            hint={primaryAction.description}
            trackingContext={`guide:${guide.slug}:primary`}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {guide.sections.map((section, index) => (
              <section key={section.title} className="glass-panel rounded-[28px] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
                  Section {index + 1}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--page-muted)]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets && (
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--page-muted)]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>・{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <ActionSpotlight
              eyebrow={secondaryAction.eyebrow}
              title={secondaryAction.title}
              body={secondaryAction.body}
              href={secondaryAction.href}
              label={secondaryAction.label}
              hint={secondaryAction.description}
              trackingContext={`guide:${guide.slug}:secondary`}
            />
          </div>

          <aside className="space-y-4">
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-sm font-semibold text-[var(--page-ink)]">この記事はこんな人向け</p>
              <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
                {guide.intent}
              </p>
            </div>
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-sm font-semibold text-[var(--page-ink)]">読む前の前提</p>
              <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
                ここで扱うのは、働き方の見直しと危ない求人を避けるための一般的な整理です。最終判断は求人票、契約内容、現場説明を見て行ってください。
              </p>
            </div>
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-sm font-semibold text-[var(--page-ink)]">関連記事</p>
              <div className="mt-4 space-y-3">
                {relatedGuides.map((relatedGuide) => (
                  <Link
                    key={relatedGuide.slug}
                    href={`/guides/${relatedGuide.slug}`}
                    className="block rounded-[20px] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm font-semibold text-[var(--page-ink)] transition hover:border-[rgba(37,99,235,0.22)]"
                  >
                    {relatedGuide.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <span className="eyebrow">次に読む</span>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
              関連ガイド
            </h2>
          </div>
          <Link href="/guides" className="secondary-button text-sm">
            一覧へ戻る
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {relatedGuides.map((relatedGuide) => (
            <GuideCard key={relatedGuide.slug} guide={relatedGuide} />
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
            {relatedJobs.map((job) => (
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
            {relatedAreas.map((area) => (
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
            {relatedApps.map((app) => (
              <HubCard key={app.slug} hub={app} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
