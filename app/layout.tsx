import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "バイト体験談マップ",
    template: "%s | バイト体験談マップ",
  },
  description: "バイトを辞めたい、きつい職場を避けたい人向けに、口コミと実践ガイドをまとめたサイト",
  openGraph: {
    title: "バイト体験談マップ",
    description: "バイトを辞めたい、きつい職場を避けたい人向けに、口コミと実践ガイドをまとめたサイト",
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
      <body className="min-h-screen antialiased text-[var(--page-ink)]">
        <Analytics />
        <Header />
        <div className="min-h-[calc(100vh-64px)]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
