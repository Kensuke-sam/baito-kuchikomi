import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "削除申請フォーム",
  description: "掲載内容の削除・非公開化を希望する場合のフォームです。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function TakedownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
