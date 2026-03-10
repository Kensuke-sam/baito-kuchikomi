import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "通報フォーム",
  description: "掲載内容に問題がある場合に通報できるフォームです。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
