import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getRealIp } from "@/lib/rateLimit";
import { sanitizeShortText } from "@/lib/sanitize";
import { isWithinSubmissionArea } from "@/lib/siteConfig";

const schema = z.object({
  name:            z.string().min(1).max(100),
  address:         z.string().min(1).max(200),
  nearest_station: z.string().max(100).optional(),
  lat:             z.number().min(-90).max(90),
  lng:             z.number().min(-180).max(180),
  area_tag:        z.string().max(50).optional(),
});

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("places")
    .select("id,name,address,nearest_station,lat,lng,area_tag,status,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("places select failed", error);
    return NextResponse.json({ error: "勤務先の取得に失敗しました。" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  // Rate limit: 1IP につき 10分間に3件まで
  const ip = getRealIp(req);
  const { allowed } = rateLimit(`places:${ip}`, 3, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "しばらく待ってから再試行してください。" }, { status: 429 });
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
    return NextResponse.json({ id: existingPlace.id, existing: true });
  }

  const { data, error } = await supabase
    .from("places")
    .insert({
      name,
      address,
      nearest_station: nearestStation,
      lat:             d.lat,
      lng:             d.lng,
      area_tag:        areaTag,
      status:          "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("places insert failed", error);
    return NextResponse.json({ error: "勤務先の登録に失敗しました。" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
