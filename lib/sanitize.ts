/**
 * HTMLタグ・制御文字を除去してプレーンテキストに正規化する。
 * React はデフォルトでテキストをエスケープするが、
 * DB 保存前にも念のりクリーンにする。
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")           // HTML タグ除去
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // 制御文字除去
    .trim()
    .slice(0, 5000);                    // 最大長
}

export function sanitizeShortText(input: unknown, maxLen = 200): string {
  return sanitizeText(input).slice(0, maxLen);
}

export function sanitizeEmail(input: unknown): string {
  const s = sanitizeShortText(input, 254);
  // 最低限の形式チェック（詳細検証は Zod に任せる）
  return s.replace(/[<>"']/g, "");
}

export function sanitizeUrl(input: unknown): string {
  const s = sanitizeShortText(input, 2000);
  // 危険スキームを除去
  if (/^(javascript|data|vbscript):/i.test(s)) return "";
  return s;
}

/** Leaflet ポップアップなど dangerouslySetInnerHTML 相当の箇所で使う HTML エスケープ */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
