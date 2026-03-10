import Link from "next/link";

interface Highlight {
  title: string;
  body: string;
}

interface Props {
  title: string;
  description: string;
  highlights: Highlight[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  eyebrow?: string;
  footnote?: string;
}

export function FirstReviewCallout({
  title,
  description,
  highlights,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  eyebrow = "最初の体験談募集",
  footnote,
}: Props) {
  return (
    <section className="section-frame p-6 sm:p-8">
      <span className="eyebrow">{eyebrow}</span>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--page-muted)] sm:text-base">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={primaryHref} className="primary-button text-sm">
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="secondary-button text-sm">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div key={highlight.title} className="glass-panel rounded-[24px] p-4">
            <p className="text-sm font-semibold text-[var(--page-ink)]">{highlight.title}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">{highlight.body}</p>
          </div>
        ))}
      </div>

      {footnote && (
        <p className="mt-5 text-xs leading-6 text-[var(--page-muted)]">
          {footnote}
        </p>
      )}
    </section>
  );
}
