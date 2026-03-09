import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexableDeployment } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const indexable = isIndexableDeployment();

  return {
    rules: indexable
      ? [
          {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/api/"],
          },
        ]
      : [
          {
            userAgent: "*",
            disallow: "/",
          },
        ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
