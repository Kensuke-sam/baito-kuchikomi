import type { Review } from "@/lib/types";
import Link from "next/link";

interface Props {
  review: Review;
  placeId?: string;
}

export function ReviewCard({ review, placeId }: Props) {
  return (
    <article className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug">
          {review.title}
        </h3>
        <span className="text-xs text-gray-400 shrink-0">
          {review.created_at.slice(0, 10)}
        </span>
      </div>

      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 whitespace-pre-line">
        {review.body}
      </p>

      {review.period_from && (
        <p className="text-xs text-gray-400 mt-2">
          勤務期間: {review.period_from}
          {review.period_to ? ` 〜 ${review.period_to}` : " 〜"}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <ReportButtonInline reviewId={review.id} />
        {placeId && (
          <Link
            href={`/places/${placeId}`}
            className="text-xs text-blue-600 hover:underline"
          >
            詳細ページへ
          </Link>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2 italic">
        ※ 投稿内容の正確性は保証しません。削除申請・訂正は
        <Link href="/takedown" className="text-blue-500 hover:underline ml-1">
          こちら
        </Link>
        から。
      </p>
    </article>
  );
}

function ReportButtonInline({ reviewId }: { reviewId: string }) {
  return (
    <a
      href={`/report?type=review&id=${reviewId}`}
      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
    >
      通報する
    </a>
  );
}
