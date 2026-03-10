import type { Review } from "@/lib/types";
import Link from "next/link";
import { ReviewHelpfulButton } from "@/components/ReviewHelpfulButton";

interface Props {
  review: Review;
  placeId?: string;
}

export function ReviewCard({ review, placeId }: Props) {
  return (
    <article className="glass-panel rounded-[28px] p-5 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug tracking-[-0.03em] text-[var(--page-ink)]">
          {review.title}
        </h3>
        <span className="shrink-0 text-xs font-medium text-[var(--page-muted)]">
          {review.created_at.slice(0, 10)}
        </span>
      </div>

      {review.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <span key={tag} className="soft-pill">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="line-clamp-5 whitespace-pre-line text-sm leading-7 text-[var(--page-muted)]">
        {review.body}
      </p>

      {review.period_from && (
        <p className="mt-3 text-xs text-[var(--page-muted)]">
          勤務期間: {review.period_from}
          {review.period_to ? ` 〜 ${review.period_to}` : " 〜"}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        {typeof review.helpful_count === "number" && (
          <ReviewHelpfulButton reviewId={review.id} initialCount={review.helpful_count} />
        )}
        <ReportButtonInline reviewId={review.id} />
        {placeId && (
          <Link
            href={`/places/${placeId}`}
            className="text-xs font-semibold text-[var(--accent)] hover:opacity-80"
          >
            詳細ページへ
          </Link>
        )}
      </div>

      <p className="mt-3 text-xs italic text-[var(--page-muted)]">
        ※ 投稿内容の正確性は保証しません。削除申請・訂正は
        <Link href="/takedown" className="ml-1 font-semibold text-[var(--accent)] hover:opacity-80">
          こちら
        </Link>
        から。
      </p>
    </article>
  );
}

function ReportButtonInline({ reviewId }: { reviewId: string }) {
  return (
    <Link
      href={`/report?type=review&id=${reviewId}`}
      className="text-xs text-[var(--page-muted)] transition-colors hover:text-red-500"
    >
      通報する
    </Link>
  );
}
