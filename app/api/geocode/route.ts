import { NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimitHeaders, getRealIp, rateLimit } from "@/lib/rateLimit";
import { sanitizeShortText } from "@/lib/sanitize";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

const schema = z.object({
  address: z.string().min(5).max(200),
});

type GeocodeResult =
  | { ok: true; lat: number; lng: number; provider: "mapbox" | "nominatim" }
  | { ok: false; error: string };

const NOT_FOUND_ERROR = "住所を地図上で特定できませんでした。もう少し詳しく入力してください。";
const NOMINATIM_MIN_INTERVAL_MS = 1000;

function notFound(): GeocodeResult {
  return {
    ok: false,
    error: NOT_FOUND_ERROR,
  };
}

function toCoordinates(lat: unknown, lng: unknown) {
  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return null;
  }

  return { lat: latNum, lng: lngNum };
}

function buildQueryCandidates(address: string) {
  const candidates = new Set<string>();

  function add(value: string) {
    const cleaned = value.trim();
    if (cleaned.length >= 5) {
      candidates.add(cleaned);
    }
  }

  const normalized = address.normalize("NFKC").trim();
  const compact = normalized.replace(/\s+/g, "");

  add(normalized);
  add(compact);

  const withoutRoom = compact.replace(/(?:[A-Za-zＡ-Ｚａ-ｚ]|[0-9]+F|[0-9]+階).*/, "");
  add(withoutRoom);

  const chomeMatch = withoutRoom.match(/^.*?[0-9]+丁目/);
  if (chomeMatch) {
    add(chomeMatch[0]);
  }

  add(withoutRoom.replace(/([0-9]+丁目)[0-9\-−ー‐].*$/, "$1"));
  add(withoutRoom.replace(/[0-9]+(?:番地?|号).*$/, ""));
  add(withoutRoom.replace(/[-−ー‐][0-9].*$/, ""));

  return [...candidates];
}

function isNotFoundResult(result: GeocodeResult) {
  return !result.ok && result.error === NOT_FOUND_ERROR;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeWithMapbox(query: string, token: string): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${encodeURIComponent(token)}&language=ja&limit=1`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const data: { features?: Array<{ center?: [number, number] }> } = await response.json();
    const center = data.features?.[0]?.center;

    if (!Array.isArray(center) || center.length !== 2) {
      return notFound();
    }

    const coordinates = toCoordinates(center[1], center[0]);
    if (!coordinates) {
      return notFound();
    }

    return { ok: true, provider: "mapbox", ...coordinates };
  } catch {
    return null;
  }
}

async function geocodeWithNominatimOnce(query: string): Promise<GeocodeResult> {
  const siteUrl = getSiteUrl();
  const contact = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || "admin@baito-review.com";

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=jp&q=${encodeURIComponent(query)}`,
    {
      cache: "no-store",
      headers: {
        "Accept-Language": "ja",
        Referer: siteUrl,
        "User-Agent": `baito-review geocoder (${contact})`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      return {
        ok: false,
        error: "住所確認が混み合っています。少し待ってから再試行してください。",
      };
    }

    return {
      ok: false,
      error: "住所確認に失敗しました。しばらくしてから再試行してください。",
    };
  }

  const data: Array<{ lat?: string; lon?: string }> = await response.json();
  const first = data[0];
  if (!first) {
    return notFound();
  }

  const coordinates = toCoordinates(first.lat, first.lon);
  if (!coordinates) {
    return notFound();
  }

  return { ok: true, provider: "nominatim", ...coordinates };
}

async function geocodeWithNominatim(query: string): Promise<GeocodeResult> {
  const candidates = buildQueryCandidates(query);
  let lastRequestStartedAt = 0;

  for (const candidate of candidates) {
    if (lastRequestStartedAt > 0) {
      const waitMs = NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastRequestStartedAt);
      if (waitMs > 0) {
        await sleep(waitMs);
      }
    }

    lastRequestStartedAt = Date.now();
    const result = await geocodeWithNominatimOnce(candidate);
    if (result.ok) {
      return result;
    }

    if (!isNotFoundResult(result)) {
      return result;
    }
  }

  return notFound();
}

export async function POST(req: Request) {
  const ip = getRealIp(req);
  const rate = await rateLimit(`geocode:${ip}`, 12, 10 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "住所確認が混み合っています。少し待ってから再試行してください。" },
      { status: 429, headers: createRateLimitHeaders(rate) }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const address = sanitizeShortText(parsed.data.address, 200);
  const query = address;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();

  if (token) {
    const mapboxResult = await geocodeWithMapbox(query, token);
    if (mapboxResult?.ok) {
      return NextResponse.json({
        ok: true,
        lat: mapboxResult.lat,
        lng: mapboxResult.lng,
        provider: mapboxResult.provider,
      });
    }
  }

  const fallbackResult = await geocodeWithNominatim(query);
  if (!fallbackResult.ok) {
    return NextResponse.json({ error: fallbackResult.error }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    lat: fallbackResult.lat,
    lng: fallbackResult.lng,
    provider: fallbackResult.provider,
  });
}
