const DEFAULT_PRODUCTION_SITE_URL = "https://baito-review.com";
const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    url.hash = "";
    url.search = "";
    url.pathname = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  return process.env.NODE_ENV === "development"
    ? LOCAL_SITE_URL
    : DEFAULT_PRODUCTION_SITE_URL;
}

export function isIndexableDeployment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv) {
    return vercelEnv === "production";
  }

  return process.env.NODE_ENV === "production";
}
