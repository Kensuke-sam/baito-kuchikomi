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
      <main className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold mb-2">通報を受け付けました</h1>
        <p className="text-sm text-gray-600 mb-4">管理者が確認します。</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">トップへ戻る</Link>
      </main>
    );
  }

  if (!targetType || !targetId) {
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">通報フォーム</h1>
        <p className="text-sm text-gray-600 mb-6">
          通報は勤務先ページまたは口コミカードの「通報する」から対象を指定して送信してください。
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900 space-y-2">
          <p className="font-semibold">対象が未指定です</p>
          <p>先に口コミ一覧や勤務先詳細を開き、対象コンテンツから通報フォームへ進んでください。</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/list" className="text-blue-600 hover:underline text-sm">口コミ一覧へ</Link>
          <Link href="/takedown" className="text-blue-600 hover:underline text-sm">削除申請はこちら</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">通報フォーム</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">通報理由 *</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">詳細（任意）</label>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={3}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white font-medium py-2.5 rounded-md text-sm"
        >
          {submitting ? "送信中…" : "通報する"}
        </button>
      </form>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<main className="max-w-md mx-auto px-4 py-8 text-sm text-gray-500">読み込み中…</main>}>
      <ReportPageInner />
    </Suspense>
  );
}
