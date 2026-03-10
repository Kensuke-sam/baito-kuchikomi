"use client";

import { useEffect, useState } from "react";
import { readErrorMessage } from "@/lib/http";

const VOTER_TOKEN_KEY = "review-helpful-voter-token";
const VOTED_REVIEW_IDS_KEY = "review-helpful-voted-review-ids";

function createVoterToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "";
}

function getOrCreateVoterToken() {
  if (typeof window === "undefined") return "";
  const existingToken = window.localStorage.getItem(VOTER_TOKEN_KEY);
  if (existingToken) return existingToken;

  const nextToken = createVoterToken();
  if (nextToken) {
    window.localStorage.setItem(VOTER_TOKEN_KEY, nextToken);
  }
  return nextToken;
}

function getVotedReviewIds() {
  if (typeof window === "undefined") return [] as string[];
  const raw = window.localStorage.getItem(VOTED_REVIEW_IDS_KEY);
  if (!raw) return [] as string[];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [] as string[];
  }
}

function markReviewAsVoted(reviewId: string) {
  if (typeof window === "undefined") return;
  const ids = new Set(getVotedReviewIds());
  ids.add(reviewId);
  window.localStorage.setItem(VOTED_REVIEW_IDS_KEY, JSON.stringify([...ids]));
}

interface Props {
  reviewId: string;
  initialCount?: number;
}

export function ReviewHelpfulButton({ reviewId, initialCount = 0 }: Props) {
  const [helpfulCount, setHelpfulCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHelpfulCount(initialCount);
    setHasVoted(getVotedReviewIds().includes(reviewId));
  }, [initialCount, reviewId]);

  async function handleClick() {
    if (submitting || hasVoted) return;

    setSubmitting(true);
    setError("");

    try {
      const voterToken = getOrCreateVoterToken();
      if (!voterToken) {
        throw new Error("評価の準備に失敗しました。ページを再読み込みしてください。");
      }

      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_token: voterToken }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "評価の送信に失敗しました。"));
      }

      const data: { ok?: boolean; already_voted?: boolean; helpful_count?: number } = await response.json();
      setHelpfulCount(typeof data.helpful_count === "number" ? data.helpful_count : helpfulCount);
      setHasVoted(true);
      markReviewAsVoted(reviewId);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "評価の送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting || hasVoted}
        aria-pressed={hasVoted}
        className="soft-pill text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        data-active={hasVoted ? true : undefined}
      >
        {hasVoted ? "役に立った済み" : "役に立った"} {helpfulCount > 0 ? `(${helpfulCount})` : ""}
      </button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
