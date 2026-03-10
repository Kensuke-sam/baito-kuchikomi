interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// 日本全国を単一の大きな矩形で扱うと国外地点まで通るため、
// 既定値は主要地域と離島を分けた複数領域で判定する。
const DEFAULT_JAPAN_REGIONS: readonly Bounds[] = [
  { minLat: 30.5, maxLat: 45.8, minLng: 129.2, maxLng: 145.9 }, // 本州・四国・九州本土・北海道
  { minLat: 31.5, maxLat: 34.9, minLng: 128.0, maxLng: 129.95 }, // 五島・壱岐・対馬など西九州離島
  { minLat: 24.0, maxLat: 30.5, minLng: 122.5, maxLng: 132.5 }, // 沖縄・先島・奄美・トカラ・大東
  { minLat: 23.0, maxLat: 28.0, minLng: 141.0, maxLng: 144.5 }, // 小笠原
  { minLat: 24.0, maxLat: 25.5, minLng: 153.0, maxLng: 154.5 }, // 南鳥島
] as const;

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

export const SUBMISSION_AREA_REGIONS: readonly Bounds[] = DEFAULT_JAPAN_REGIONS;

export const SUBMISSION_AREA_BOUNDS = getCombinedBounds(SUBMISSION_AREA_REGIONS);
export const SUBMISSION_AREA_PREVIEW_BOUNDS = getCombinedBounds(DEFAULT_JAPAN_REGIONS);

export function isWithinSubmissionArea(lat: number, lng: number): boolean {
  return SUBMISSION_AREA_REGIONS.some(
    (region) =>
      lat >= region.minLat &&
      lat <= region.maxLat &&
      lng >= region.minLng &&
      lng <= region.maxLng
  );
}
