"use client";

import { useState } from "react";
import Link from "next/link";
import { TAKEDOWN_REASONS } from "@/lib/types";

export default function TakedownPage() {
  const [form, setForm] = useState({
    target_url: "",
    contact_name: "",
    contact_email: "",
    reason: TAKEDOWN_REASONS[0] as string,
    detail: "",
    evidence_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.target_url || !form.contact_name || !form.contact_email || !form.detail) {
      setError("必須項目をすべて入力してください。");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/takedowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
            削除申請を受け付けました
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--page-muted)]">
            内容を確認の上、ご連絡いただいたメールアドレス宛にご回答します（通常5営業日以内）。
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

  return (
    <main className="app-shell mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <section className="section-frame p-6 sm:p-8">
        <span className="eyebrow">削除申請</span>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
          削除申請フォーム
        </h1>

        <div className="glass-panel mt-6 rounded-[24px] p-5">
          <p className="text-sm font-semibold text-[var(--page-ink)]">⚠️ 申請前にご確認ください</p>
          <div className="mt-2 space-y-1 text-sm leading-7 text-[var(--page-muted)]">
            <p>・内容確認のためご連絡することがあります。</p>
            <p>・虚偽の申請はお控えください。</p>
            <p>・受付後、内容を精査した上で対応します。即時削除を保証するものではありません。</p>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">対象ページのURL *</label>
            <input
              className="field-input text-sm text-[var(--page-ink)]"
              placeholder="https://..."
              value={form.target_url}
              onChange={(e) => setForm({ ...form, target_url: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">お名前（または組織名）*</label>
              <input
                className="field-input text-sm text-[var(--page-ink)]"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">メールアドレス *</label>
              <input
                type="email"
                className="field-input text-sm text-[var(--page-ink)]"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">申請理由 *</label>
            <select
              className="field-input text-sm text-[var(--page-ink)]"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            >
              {TAKEDOWN_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">詳細 *（具体的な問題箇所など）</label>
            <textarea
              className="field-textarea text-sm leading-7 text-[var(--page-ink)]"
              rows={4}
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">証拠資料URL（任意）</label>
            <input
              className="field-input text-sm text-[var(--page-ink)]"
              placeholder="https://..."
              value={form.evidence_url}
              onChange={(e) => setForm({ ...form, evidence_url: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="primary-button w-full text-sm disabled:opacity-60"
          >
            {submitting ? "送信中…" : "削除申請を送信"}
          </button>
        </form>
      </section>
    </main>
  );
}
