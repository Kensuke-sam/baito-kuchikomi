import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { createRateLimitHeaders, rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeShortText } from "@/lib/sanitize";
import { isWithinSubmissionArea } from "@/lib/siteConfig";

const schema = z.object({
  name:            z.string().min(1).max(100),
  address:         z.string().min(1).max(200),
  nearest_station: z.string().max(100).optional(),
  lat:             z.number().min(-90).max(90),
  lng:             z.number().min(-180).max(180),
  area_tag:        z.string().max(50).optional(),
  submission_token: z.string().uuid().optional(),
});

const PLACES_PAGE_LIMIT = 500;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(0, Number(searchParams.get("page") ?? 0));

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("places")
    .select("id,name,address,nearest_station,lat,lng,area_tag,status,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(page * PLACES_PAGE_LIMIT, (page + 1) * PLACES_PAGE_LIMIT - 1);

  if (error) {
    console.error("places select failed", error);
    return NextResponse.json({ error: "勤務先の取得に失敗しました。" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  // Rate limit: 1IP につき 10分間に3件まで
  const ip = getRealIp(req);
  const rate = await rateLimit(`places:${ip}`, 3, 10 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "しばらく待ってから再試行してください。" },
      { status: 429, headers: createRateLimitHeaders(rate) }
    );
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }

  const d = parsed.data;
  const supabase = createAdminClient();
  const name = sanitizeShortText(d.name, 100);
  const address = sanitizeShortText(d.address, 200);
  const nearestStation = d.nearest_station ? sanitizeShortText(d.nearest_station, 100) || null : null;
  const areaTag = d.area_tag ? sanitizeShortText(d.area_tag, 50) || null : null;
  const submissionToken = d.submission_token ?? null;

  if (!name || !address) {
    return NextResponse.json(
      { error: "勤務先名と住所は空欄のまま投稿できません。" },
      { status: 422 }
    );
  }

  if (!isWithinSubmissionArea(d.lat, d.lng)) {
    return NextResponse.json(
      { error: "現在は日本国内の勤務先のみ投稿できます。" },
      { status: 422 }
    );
  }

  if (submissionToken) {
    const { data: existingByToken, error: tokenError } = await supabase
      .from("places")
      .select("id")
      .eq("submission_token", submissionToken)
      .maybeSingle();

    if (tokenError) {
      console.error("places token lookup failed", tokenError);
      return NextResponse.json({ error: "勤務先の確認に失敗しました。" }, { status: 500 });
    }

    if (existingByToken) {
      return NextResponse.json({ ok: true, id: existingByToken.id, existing: true });
    }
  }

  const { data: existingPlaces, error: existingError } = await supabase
    .from("places")
    .select("id")
    .eq("name", name)
    .eq("address", address)
    .in("status", ["pending", "approved"])
    .order("created_at", { ascending: true })
    .limit(1);

  if (existingError) {
    console.error("places existing check failed", existingError);
    return NextResponse.json({ error: "勤務先の確認に失敗しました。" }, { status: 500 });
  }

  const existingPlace = existingPlaces?.[0];
  if (existingPlace) {
    return NextResponse.json({ ok: true, id: existingPlace.id, existing: true });
  }

  const { data, error } = await supabase
    .from("places")
    .insert({
      name,
      address,
      nearest_station: nearestStation,
      lat: d.lat,
      lng: d.lng,
      area_tag: areaTag,
      status: "pending",
      submission_token: submissionToken,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" && submissionToken) {
      const { data: existingByToken, error: tokenError } = await supabase
        .from("places")
        .select("id")
        .eq("submission_token", submissionToken)
        .maybeSingle();

      if (tokenError) {
        console.error("places token lookup after conflict failed", tokenError);
        return NextResponse.json({ error: "勤務先の確認に失敗しました。" }, { status: 500 });
      }

      if (existingByToken) {
        return NextResponse.json({ ok: true, id: existingByToken.id, existing: true });
      }
    }

    console.error("places insert failed", error);
    return NextResponse.json({ error: "勤務先の登録に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id, existing: false }, { status: 201 });
}
