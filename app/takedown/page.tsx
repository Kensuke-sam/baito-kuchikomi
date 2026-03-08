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
      <main className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">削除申請を受け付けました</h1>
        <p className="text-sm text-gray-600 mb-6">
          内容を確認の上、ご連絡いただいたメールアドレス宛にご回答します（通常5営業日以内）。
        </p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">トップへ戻る</Link>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-2">削除申請フォーム</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-900 space-y-1">
        <p className="font-semibold">⚠️ 申請前にご確認ください</p>
        <p>・内容確認のためご連絡することがあります。</p>
        <p>・虚偽の申請はお控えください。</p>
        <p>・受付後、内容を精査した上で対応します。即時削除を保証するものではありません。</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">対象ページのURL *</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="https://..."
            value={form.target_url}
            onChange={(e) => setForm({ ...form, target_url: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">お名前（または組織名）*</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">申請理由 *</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          >
            {TAKEDOWN_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">詳細 *（具体的な問題箇所など）</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={4}
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">証拠資料URL（任意）</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="https://..."
            value={form.evidence_url}
            onChange={(e) => setForm({ ...form, evidence_url: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md text-sm"
        >
          {submitting ? "送信中…" : "削除申請を送信"}
        </button>
      </form>
    </main>
  );
}
