"use client";

import Link from "next/link";
import { isExternalHref } from "@/lib/partnerLinks";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface Props {
  href: string;
  label: string;
  className: string;
  trackingContext?: string;
}

function trackAffiliateClick({
  href,
  label,
  trackingContext,
}: {
  href: string;
  label: string;
  trackingContext?: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    link_url: href,
    link_text: label,
    placement: trackingContext ?? "cta",
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", "affiliate_click", payload);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "affiliate_click",
      ...payload,
    });
  }
}

export function TrackedCtaLink({ href, label, className, trackingContext }: Props) {
  const isExternal = isExternalHref(href);

  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        onClick={() => trackAffiliateClick({ href, label, trackingContext })}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
