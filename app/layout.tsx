import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "バイト体験談マップ",
    template: "%s | バイト体験談マップ",
  },
  description: "アルバイト・パートの体験談を地図で探せる口コミプラットフォーム",
  openGraph: {
    title: "バイト体験談マップ",
    description: "アルバイト・パートの体験談を地図で探せる口コミプラットフォーム",
    siteName: "バイト体験談マップ",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-white text-gray-900">
        <Header />
        {children}
      </body>
    </html>
  );
}
