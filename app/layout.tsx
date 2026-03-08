import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "バイト体験談マップ",
  description: "アルバイト・パートの体験談を地図で探せる口コミプラットフォーム",
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
