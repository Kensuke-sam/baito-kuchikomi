"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { REPORT_REASONS } from "@/lib/types";

function ReportPageInner() {
  const searchParams = useSearchParams();
  const targetType = searchParams.get("type") as "place" | "review" | null;
  const targetId = searchParams.get("id") ?? "";

  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!targetType || !targetId) {
      setError("通報対象が不明です。元のページから操作してください。");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason, detail }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "通報に失敗しました。");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="app-shell mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <section className="section-frame p-8 text-center sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-3xl text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)]">
            ✓
          </div>
          <p className="mt-6">
            <span className="eyebrow">受付完了</span>
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
            通報を受け付けました
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--page-muted)]">
            管理者が内容を確認し、対応します。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="primary-button text-sm">
              トップへ戻る
            </Link>
            <Link href="/list" className="secondary-button text-sm">
              一覧を見る
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!targetType || !targetId) {
    return (
      <main className="app-shell mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <section className="section-frame p-6 sm:p-8">
          <span className="eyebrow">通報</span>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
            通報フォーム
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
            通報は勤務先ページまたは口コミカードの「通報する」から対象を指定して送信してください。
          </p>
          <div className="glass-panel mt-6 rounded-[24px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">対象が未指定です</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              先に口コミ一覧や勤務先詳細を開き、対象コンテンツから通報フォームへ進んでください。
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/list" className="primary-button text-sm">口コミ一覧へ</Link>
            <Link href="/takedown" className="secondary-button text-sm">削除申請はこちら</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">通報</span>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
          通報フォーム
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
          掲載内容に問題がある場合はこちらから通報できます。
        </p>

        {error && (
          <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">通報理由 *</label>
            <select
              className="field-input text-sm text-[var(--page-ink)]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">詳細（任意）</label>
            <textarea
              className="field-textarea text-sm leading-7 text-[var(--page-ink)]"
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="primary-button w-full text-sm disabled:opacity-60"
          >
            {submitting ? "送信中…" : "通報する"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-8 text-sm text-[var(--page-muted)]">読み込み中…</main>}>
      <ReportPageInner />
    </Suspense>
  );
}
