function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export const SUBMISSION_AREA_LABEL =
  process.env.NEXT_PUBLIC_SUBMISSION_AREA_LABEL?.trim() || "赤羽〜池袋周辺";

export const SUBMISSION_AREA_BOUNDS = (() => {
  const minLat = parseNumber(process.env.NEXT_PUBLIC_ALLOWED_MIN_LAT);
  const maxLat = parseNumber(process.env.NEXT_PUBLIC_ALLOWED_MAX_LAT);
  const minLng = parseNumber(process.env.NEXT_PUBLIC_ALLOWED_MIN_LNG);
  const maxLng = parseNumber(process.env.NEXT_PUBLIC_ALLOWED_MAX_LNG);

  if (
    minLat === null ||
    maxLat === null ||
    minLng === null ||
    maxLng === null
  ) {
    return null;
  }

  return { minLat, maxLat, minLng, maxLng };
})();

export function isWithinSubmissionArea(lat: number, lng: number): boolean {
  if (!SUBMISSION_AREA_BOUNDS) return true;

  return (
    lat >= SUBMISSION_AREA_BOUNDS.minLat &&
    lat <= SUBMISSION_AREA_BOUNDS.maxLat &&
    lng >= SUBMISSION_AREA_BOUNDS.minLng &&
    lng <= SUBMISSION_AREA_BOUNDS.maxLng
  );
}
