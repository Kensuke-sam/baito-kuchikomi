import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "当事者コメント送信",
  description: "投稿内容に関する反論・補足・訂正を送信できるフォームです。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function OfficialResponseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
