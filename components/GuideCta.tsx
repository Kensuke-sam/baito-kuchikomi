import { TrackedCtaLink } from "@/components/TrackedCtaLink";
import type { GuideLink } from "@/lib/guides";

interface Props {
  eyebrow?: string;
  title: string;
  description: string;
  primary: GuideLink;
  secondary?: GuideLink;
  trackingContext?: string;
}

export function GuideCta({
  eyebrow = "Next Action",
  title,
  description,
  primary,
  secondary,
  trackingContext,
}: Props) {
  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-6">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--page-muted)]">
        {description}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 rounded-[24px] border border-[var(--line)] bg-white/72 px-4 py-4">
          <p className="text-sm font-semibold text-[var(--page-ink)]">{primary.label}</p>
          <p className="mt-1 text-xs leading-6 text-[var(--page-muted)]">{primary.description}</p>
          <div className="mt-4">
            <TrackedCtaLink
              href={primary.href}
              label={primary.label}
              className="primary-button text-sm"
              trackingContext={trackingContext ? `${trackingContext}:primary` : "guide-cta:primary"}
            />
          </div>
        </div>
        {secondary && (
          <div className="flex-1 rounded-[24px] border border-[var(--line)] bg-white/72 px-4 py-4">
            <p className="text-sm font-semibold text-[var(--page-ink)]">{secondary.label}</p>
            <p className="mt-1 text-xs leading-6 text-[var(--page-muted)]">{secondary.description}</p>
            <div className="mt-4">
              <TrackedCtaLink
                href={secondary.href}
                label={secondary.label}
                className="secondary-button text-sm"
                trackingContext={trackingContext ? `${trackingContext}:secondary` : "guide-cta:secondary"}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
