import type { ContentStatus, RequestStatus } from "@/lib/types";

const CONTENT_COLORS: Record<ContentStatus, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  removed:  "bg-gray-200 text-gray-600",
};

const REQUEST_COLORS: Record<RequestStatus, string> = {
  received:      "bg-blue-100 text-blue-800",
  investigating: "bg-orange-100 text-orange-800",
  resolved:      "bg-green-100 text-green-800",
};

const CONTENT_LABELS: Record<ContentStatus, string> = {
  pending:  "承認待ち",
  approved: "公開中",
  rejected: "非公開",
  removed:  "削除済",
};

const REQUEST_LABELS: Record<RequestStatus, string> = {
  received:      "受付",
  investigating: "調査中",
  resolved:      "対応済",
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${CONTENT_COLORS[status]}`}>
      {CONTENT_LABELS[status]}
    </span>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${REQUEST_COLORS[status]}`}>
      {REQUEST_LABELS[status]}
    </span>
  );
}
