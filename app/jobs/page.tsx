import type { Metadata } from "next";
import Link from "next/link";
import { HubCard } from "@/components/HubCard";
import { getJobHubs } from "@/lib/hubs";

export const metadata: Metadata = {
  title: "職種別バイトガイド",
  description:
    "コンビニ、居酒屋、カフェ、倉庫、スーパーなど、大学生が職種ごとのきつさや向き不向きを比べるためのハブです。",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "職種別バイトガイド",
    description: "コンビニ、居酒屋、カフェ、倉庫、スーパーなど、大学生が職種ごとのきつさや向き不向きを比べるためのハブです。",
    url: "/jobs",
    locale: "ja_JP",
    type: "website",
  },
};

export default function JobsPage() {
  const jobs = getJobHubs();

  return (
    <main className="app-shell mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">職種ハブ</span>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
              職種ごとのきつさと向き不向きを先に見る。
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
              同じ「バイト探し」でも、職種が変わるとしんどさの種類が変わります。大学生が失敗しにくいように、
              職種ごとの負荷や見極めポイントを先に整理できるようにしました。
            </p>
          </div>
          <Link href="/guides" className="secondary-button text-sm">
            悩み別ガイドへ
          </Link>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-sm font-semibold text-[var(--page-ink)]">比較の軸</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              忙しさ、接客量、時間帯、教育の見えやすさで比べると失敗が減ります。
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-sm font-semibold text-[var(--page-ink)]">大学生向けの見方</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              授業との両立、終電、生活リズムを軽く見ないことが重要です。
            </p>
          </div>
          <div className="glass-panel rounded-[24px] p-4">
            <p className="text-sm font-semibold text-[var(--page-ink)]">次の探し方につなげる</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              職種ごとの特徴を押さえたあと、求人比較や単発バイト比較に進むと候補を絞りやすくなります。
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {jobs.map((job) => (
            <HubCard key={job.slug} hub={job} />
          ))}
        </div>
      </section>
    </main>
  );
}
