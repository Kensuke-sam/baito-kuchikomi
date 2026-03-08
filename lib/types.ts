export type ContentStatus = "pending" | "approved" | "rejected" | "removed";
export type RequestStatus = "received" | "investigating" | "resolved";
export type TargetType = "place" | "review";

export interface Place {
  id: string;
  name: string;
  address: string;
  nearest_station?: string;
  lat: number;
  lng: number;
  area_tag?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  place_id: string;
  title: string;
  body: string;
  tags: string[];
  period_from?: string;
  period_to?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface OfficialResponse {
  id: string;
  place_id: string;
  body: string;
  status: ContentStatus;
  created_at: string;
}

export interface Report {
  id: string;
  target_type: TargetType;
  target_id: string;
  reason: string;
  detail?: string;
  status: RequestStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TakedownRequest {
  id: string;
  target_url: string;
  contact_name: string;
  contact_email: string;
  reason: string;
  detail?: string;
  evidence_url?: string;
  status: RequestStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

// フォーム入力用
export const REVIEW_TAGS = [
  "給与・賃金",
  "シフト",
  "人間関係",
  "研修",
  "残業",
  "業務内容",
  "職場環境",
  "退職・離職",
] as const;

export const REPORT_REASONS = [
  "個人が特定できる情報が含まれている",
  "事実と異なる内容が含まれている",
  "誹謗・中傷・差別的表現がある",
  "プライバシーの侵害",
  "その他",
] as const;

export const TAKEDOWN_REASONS = [
  "投稿に関する当事者・企業からの申請",
  "名誉毀損に該当する可能性がある",
  "プライバシー権の侵害",
  "著作権侵害",
  "その他",
] as const;
