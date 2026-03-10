import Image from "next/image";
import Link from "next/link";
import type { GuideEntry } from "@/lib/guides";

const guideThumbnails: Record<string, string> = {
  "baito-yametai-daigakusei": "/images/guide-yametai.png",
  "black-baito-miwakekata": "/images/guide-miwakekata.png",
  "tanpatsu-baito-app-hikaku": "/images/guide-tanpatsu.png",
};

interface Props {
  guide: GuideEntry;
}

export function GuideCard({ guide }: Props) {
  const thumbnail = guideThumbnails[guide.slug];

  return (
    <article className="glass-panel rounded-[28px] overflow-hidden">
      {thumbnail && (
        <Link href={`/guides/${guide.slug}`} className="block">
          <Image
            src={thumbnail}
            alt={guide.title}
            width={600}
            height={400}
            className="guide-card-thumbnail"
          />
        </Link>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--page-muted)]">
          <span className="soft-pill" data-active>
            {guide.category}
          </span>
          <span>{guide.readingTime}</span>
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
          <Link href={`/guides/${guide.slug}`} className="hover:opacity-80">
            {guide.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
          {guide.excerpt}
        </p>
        <p className="mt-4 text-xs leading-6 text-[var(--page-muted)]">
          想定読者: {guide.intent}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/guides/${guide.slug}`} className="primary-button text-sm">
            記事を読む
          </Link>
        </div>
      </div>
    </article>
  );
}
