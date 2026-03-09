import type { Metadata } from "next";
import Link from "next/link";
import { HubCard } from "@/components/HubCard";
import { getAreaHubs } from "@/lib/hubs";

export const metadata: Metadata = {
  title: "地域別バイトガイド",
  description:
    "東京、大阪、名古屋、福岡など、大学生が地域ごとにバイトを比較するときの見方をまとめたハブです。",
};

export default function AreasPage() {
  const areas = getAreaHubs();

  return (
    <main className="app-shell mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">Area Hubs</span>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)] sm:text-4xl">
              地域ごとの探し方を、大学生向けに整理する。
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
              同じ職種でも、地域や駅、時間帯でしんどさは変わります。大きい都市ほど案件数の多さに流されやすいので、
              通学導線、終電、仕事内容の見えやすさで比較する前提を作ります。
            </p>
          </div>
          <Link href="/list" className="secondary-button text-sm">
            口コミ一覧へ
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {areas.map((area) => (
            <HubCard key={area.slug} hub={area} />
          ))}
        </div>
      </section>
    </main>
  );
}
