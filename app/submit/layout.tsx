import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "体験談を投稿",
  description: "勤務先の登録と体験談の投稿をまとめて受け付けます。掲載前に管理者が確認します。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
