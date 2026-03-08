"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readErrorMessage } from "@/lib/http";

interface Props {
  id: string;
}

export function AdminReviewActions({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function update(status: "approved" | "rejected" | "removed") {
    setLoading(status);
    setError("");

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "レビューの更新に失敗しました。"));
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "レビューの更新に失敗しました。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => update("approved")}
          disabled={loading !== null}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-md"
        >
          {loading === "approved" ? "…" : "✅ 承認・公開"}
        </button>
        <button
          onClick={() => update("rejected")}
          disabled={loading !== null}
          className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-md"
        >
          {loading === "rejected" ? "…" : "🚫 非公開"}
        </button>
        <button
          onClick={() => update("removed")}
          disabled={loading !== null}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-md"
        >
          {loading === "removed" ? "…" : "🗑 削除"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
