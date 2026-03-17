/**
 * buildBreadcrumbSchema
 * サイト内全ページで共通の 3 階層 BreadcrumbList JSON-LD を生成します。
 * 第 1 階層は常に "ホーム" (siteUrl) です。
 */
export function buildBreadcrumbSchema(
  siteUrl: string,
  parent: { name: string; path: string },
  current: { name: string; url: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
      { "@type": "ListItem", position: 2, name: parent.name, item: `${siteUrl}${parent.path}` },
      { "@type": "ListItem", position: 3, name: current.name, item: current.url },
    ],
  };
}
