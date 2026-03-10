function parseNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const LEGACY_DEFAULT_JAPAN_BOUNDS: Bounds = {
  minLat: 24.0,
  maxLat: 46.0,
  minLng: 123.0,
  maxLng: 146.0,
};

function getCombinedBounds(regions: readonly Bounds[]): Bounds {
  return regions.reduce(
    (combined, region) => ({
      minLat: Math.min(combined.minLat, region.minLat),
      maxLat: Math.max(combined.maxLat, region.maxLat),
      minLng: Math.min(combined.minLng, region.minLng),
      maxLng: Math.max(combined.maxLng, region.maxLng),
    }),
    { ...regions[0] }
  );
}

const customBounds = (() => {
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

export const SUBMISSION_AREA_REGIONS: readonly Bounds[] =
  [customBounds ?? LEGACY_DEFAULT_JAPAN_BOUNDS];

export const SUBMISSION_AREA_BOUNDS = getCombinedBounds(SUBMISSION_AREA_REGIONS);
export const SUBMISSION_AREA_PREVIEW_BOUNDS = customBounds ?? LEGACY_DEFAULT_JAPAN_BOUNDS;

export function isWithinSubmissionArea(lat: number, lng: number): boolean {
  return SUBMISSION_AREA_REGIONS.some(
    (region) =>
      lat >= region.minLat &&
      lat <= region.maxLat &&
      lng >= region.minLng &&
      lng <= region.maxLng
  );
}
