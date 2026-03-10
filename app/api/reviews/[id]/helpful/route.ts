import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { createRateLimitHeaders, getRealIp, rateLimit } from "@/lib/rateLimit";

const schema = z.object({
  voter_token: z.string().uuid(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getRealIp(req);
  const rate = await rateLimit(`review-helpful:${ip}`, 30, 60 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "しばらく待ってから再試行してください。" },
      { status: 429, headers: createRateLimitHeaders(rate) }
    );
  }

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "不正なIDです。" }, { status: 400 });
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

  const supabase = createAdminClient();
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id, status, helpful_count")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (reviewError) {
    console.error("review helpful lookup failed", reviewError);
    return NextResponse.json({ error: "体験談の確認に失敗しました。" }, { status: 500 });
  }

  if (!review) {
    return NextResponse.json({ error: "対象の体験談が見つかりません。" }, { status: 404 });
  }

  const { error: voteError } = await supabase.from("review_helpful_votes").insert({
    review_id: id,
    voter_token: parsed.data.voter_token,
  });

  if (voteError) {
    if (voteError.code === "23505") {
      const { count, error: countError } = await supabase
        .from("review_helpful_votes")
        .select("*", { count: "exact", head: true })
        .eq("review_id", id);

      if (countError) {
        console.error("review helpful vote count failed after duplicate", countError);
        return NextResponse.json({ error: "評価の確認に失敗しました。" }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        already_voted: true,
        helpful_count: count ?? review.helpful_count ?? 0,
      });
    }

    console.error("review helpful vote insert failed", voteError);
    return NextResponse.json({ error: "評価の保存に失敗しました。" }, { status: 500 });
  }

  const { count, error: countError } = await supabase
    .from("review_helpful_votes")
    .select("*", { count: "exact", head: true })
    .eq("review_id", id);

  if (countError) {
    console.error("review helpful vote count failed", countError);
    return NextResponse.json({ error: "評価の件数取得に失敗しました。" }, { status: 500 });
  }

  const nextHelpfulCount = count ?? (review.helpful_count ?? 0) + 1;

  const { data: updatedReview, error: updateError } = await supabase
    .from("reviews")
    .update({ helpful_count: nextHelpfulCount })
    .eq("id", id)
    .select("helpful_count")
    .single();

  if (updateError) {
    console.error("review helpful count update failed", updateError);
    return NextResponse.json({ error: "評価の更新に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    already_voted: false,
    helpful_count: updatedReview.helpful_count ?? nextHelpfulCount,
  });
}
