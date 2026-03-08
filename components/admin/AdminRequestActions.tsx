"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@/lib/types";
import { readErrorMessage } from "@/lib/http";

interface Props {
  id: string;
  type: "reports" | "takedowns";
  currentStatus: RequestStatus;
}

export function AdminRequestActions({ id, type, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function update(status: RequestStatus) {
    setLoading(status);
    setError("");

    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes || undefined }),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, "申請の更新に失敗しました。"));
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "申請の更新に失敗しました。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <input
        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
        placeholder="管理者メモ（任意）"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2 flex-wrap">
        {currentStatus !== "investigating" && (
          <button
            onClick={() => update("investigating")}
            disabled={loading !== null}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-md"
          >
            {loading === "investigating" ? "…" : "🔍 調査中"}
          </button>
        )}
        {currentStatus !== "resolved" && (
          <button
            onClick={() => update("resolved")}
            disabled={loading !== null}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-md"
          >
            {loading === "resolved" ? "…" : "✅ 対応済"}
          </button>
        )}
        {currentStatus !== "received" && (
          <button
            onClick={() => update("received")}
            disabled={loading !== null}
            className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-md"
          >
            {loading === "received" ? "…" : "↩ 受付に戻す"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
