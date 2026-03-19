import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionSpotlight } from "@/components/ActionSpotlight";
import { GuideCard } from "@/components/GuideCard";
import { HubCard } from "@/components/HubCard";
import { PromotionNotice } from "@/components/PromotionNotice";
import { getRelatedGuides } from "@/lib/guides";
import { getAreaHubBySlug, getAreaHubs, getHubPath, getSiblingHubs } from "@/lib/hubs";
import { getPartnerLink, isExternalHref } from "@/lib/partnerLinks";
import { buildBreadcrumbSchema } from "@/lib/schema";
import { getSiteUrl } from "@/lib/siteUrl";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAreaHubs().map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getAreaHubBySlug(slug);
  if (!hub) return { title: "ページが見つかりません" };

  const pageUrl = `${getSiteUrl()}/areas/${hub.slug}`;

  return {
    title: hub.title,
    description: hub.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: hub.title,
      description: hub.description,
      url: pageUrl,
      type: "article",
      locale: "ja_JP",
    },
  };
}

export default async function AreaDetailPage({ params }: Props) {
  const { slug } = await params;
  const hub = getAreaHubBySlug(slug);
  if (!hub) notFound();

  const relatedGuides = getRelatedGuides(hub.relatedGuideSlugs);
  const siblingHubs = getSiblingHubs("areas", hub.slug);
  const partner = getPartnerLink(hub.partnerKey);
  const hasSponsoredLink = isExternalHref(partner.href);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${getHubPath(hub)}`;

  const breadcrumbStructuredData = buildBreadcrumbSchema(
    siteUrl,
    { name: "地域別バイトガイド", path: "/areas" },
    { name: hub.title, url: pageUrl }
  );

  return (
    <main className="app-shell mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />

      <nav aria-label="パンくずリスト" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[var(--page-muted)]">
        <Link href="/" className="hover:text-[var(--page-ink)]">ホーム</Link>
        <span aria-hidden>/</span>
        <Link href="/areas" className="hover:text-[var(--page-ink)]">地域別バイトガイド</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{hub.shortTitle}</span>
      </nav>

      <article className="section-frame p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="soft-pill" data-active>{hub.shortTitle}</span>
            <span className="soft-pill">{hub.eyebrow}</span>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
            {hub.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
            {hub.description}
          </p>
          <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-white/70 p-5">
            <ul className="space-y-3 text-sm leading-7 text-[var(--page-muted)]">
              {hub.highlights.map((point) => (
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
            eyebrow="次のアクション"
            title={hub.ctaTitle}
            body={hub.ctaBody}
            href={partner.href}
            label={partner.label}
            hint={partner.description}
            trackingContext={`area:${hub.slug}:primary`}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {hub.sections.map((section, index) => (
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
          </div>

          <aside className="space-y-4">
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-sm font-semibold text-[var(--page-ink)]">この記事はこんな人向け</p>
              <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
                {hub.intent}
              </p>
            </div>
            <div className="glass-panel rounded-[28px] p-5">
              <p className="text-sm font-semibold text-[var(--page-ink)]">関連ガイド</p>
              <div className="mt-4 space-y-3">
                {relatedGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="block rounded-[20px] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm font-semibold text-[var(--page-ink)] transition hover:border-[rgba(37,99,235,0.22)]"
                  >
                    {guide.title}
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
            <span className="eyebrow">他の地域</span>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
              他の地域も比較する
            </h2>
          </div>
          <Link href="/areas" className="secondary-button text-sm">
            一覧へ戻る
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {siblingHubs.map((entry) => (
            <HubCard key={entry.slug} hub={entry} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <span className="eyebrow">関連ガイド</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
            関連ガイド
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {relatedGuides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>
    </main>
  );
}
