import type { Metadata } from "next";
import Link from "next/link";
import { HubCard } from "@/components/HubCard";
import { getAppHubs } from "@/lib/hubs";

export const metadata: Metadata = {
  title: "アプリ・求人サービス比較",
  description:
    "タイミー系、シェアフル系、総合求人系など、大学生がバイト探しで使うサービスの見方をまとめたハブです。",
};

export default function AppsPage() {
  const apps = getAppHubs();

  return (
    <main className="app-shell mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">アプリ・サービス</span>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
              単発アプリと求人サービスを、使い方ごとに見分ける。
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
              今すぐ働きたいのか、次の本命バイトを探したいのかで、見るべきサービスは変わります。
              大学生が失敗しにくいように、単発と長期を分けて整理しています。
            </p>
          </div>
          <Link href="/guides/tanpatsu-baito-app-hikaku" className="secondary-button text-sm">
            単発ガイドへ
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {apps.map((app) => (
            <HubCard key={app.slug} hub={app} />
          ))}
        </div>
      </section>
    </main>
  );
}
