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
      <main className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold mb-2">コメントを受け付けました</h1>
        <p className="text-sm text-gray-600 mb-4">管理者確認後、掲載されます。</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">トップへ戻る</Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-2">当事者コメント送信</h1>
      <p className="text-sm text-gray-600 mb-6">
        投稿内容に関する反論・補足・訂正を送信できます。管理者が確認後、該当ページに掲載します。
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">コメント内容 *</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
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
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md text-sm"
        >
          {submitting ? "送信中…" : "コメントを送信（管理者確認後に掲載）"}
        </button>
      </form>
    </main>
  );
}

export default function OfficialResponsePage() {
  return (
    <Suspense fallback={<main className="max-w-md mx-auto px-4 py-8 text-sm text-gray-500">読み込み中…</main>}>
      <OfficialResponsePageInner />
    </Suspense>
  );
}
