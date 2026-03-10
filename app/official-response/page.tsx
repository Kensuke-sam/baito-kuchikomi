"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function OfficialResponsePageInner() {
  const searchParams = useSearchParams();
  const placeId = searchParams.get("place_id") ?? "";

  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!placeId) {
      setError("対象の勤務先が不明です。勤務先ページから操作してください。");
      return;
    }
    if (body.length < 20) {
      setError("コメントは20文字以上で入力してください。");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/official-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: placeId, body }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "送信に失敗しました。");
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
            コメントを受け付けました
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--page-muted)]">
            管理者確認後、該当ページに掲載されます。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="primary-button text-sm">
              トップへ戻る
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!placeId) {
    return (
      <main className="app-shell mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <section className="section-frame p-6 sm:p-8">
          <span className="eyebrow">当事者コメント</span>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
            当事者コメント送信
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
            当事者コメントは勤務先詳細ページから対象を指定して送信してください。
          </p>
          <div className="glass-panel mt-6 rounded-[24px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">対象の勤務先が未指定です</p>
            <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
              勤務先詳細ページの「当事者コメントを送る」から進むと、その勤務先に紐づいた形で送信できます。
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
        <span className="eyebrow">当事者コメント</span>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
          当事者コメント送信
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--page-muted)]">
          投稿内容に関する反論・補足・訂正を送信できます。管理者が確認後、該当ページに掲載します。
        </p>

        {error && (
          <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">コメント内容 *</label>
            <textarea
              className="field-textarea text-sm leading-7 text-[var(--page-ink)]"
              rows={6}
              placeholder="投稿内容への反論・訂正・補足を記入してください。"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="primary-button w-full text-sm disabled:opacity-60"
          >
            {submitting ? "送信中…" : "コメントを送信（管理者確認後に掲載）"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function OfficialResponsePage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-8 text-sm text-[var(--page-muted)]">読み込み中…</main>}>
      <OfficialResponsePageInner />
    </Suspense>
  );
}
