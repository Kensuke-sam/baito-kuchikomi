import { TrackedCtaLink } from "@/components/TrackedCtaLink";

interface Props {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  label: string;
  hint?: string;
  trackingContext?: string;
}

export function ActionSpotlight({ eyebrow, title, body, href, label, hint, trackingContext }: Props) {
  return (
    <section className="glass-panel rounded-[28px] border border-[rgba(37,99,235,0.12)] p-5 sm:p-6">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
        {body}
      </p>
      {hint && (
        <p className="mt-3 text-xs leading-6 text-[var(--page-muted)]">
          {hint}
        </p>
      )}
      <div className="mt-5">
        <TrackedCtaLink
          href={href}
          label={label}
          className="primary-button text-sm"
          trackingContext={trackingContext}
        />
      </div>
    </section>
  );
}
