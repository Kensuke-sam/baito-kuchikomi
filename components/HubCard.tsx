import Link from "next/link";
import type { HubEntry } from "@/lib/hubs";
import { getHubPath } from "@/lib/hubs";

interface Props {
  hub: HubEntry;
}

export function HubCard({ hub }: Props) {
  return (
    <article className="glass-panel rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--page-muted)]">
        <span className="soft-pill" data-active>
          {hub.shortTitle}
        </span>
        <span>{hub.eyebrow}</span>
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
        <Link href={getHubPath(hub)} className="hover:opacity-80">
          {hub.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
        {hub.excerpt}
      </p>
      <p className="mt-4 text-xs leading-6 text-[var(--page-muted)]">
        想定読者: {hub.intent}
      </p>
      <div className="mt-5">
        <Link href={getHubPath(hub)} className="secondary-button text-sm">
          この特集を見る
        </Link>
      </div>
    </article>
  );
}
