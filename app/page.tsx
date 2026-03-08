import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Place } from "@/lib/types";
import Map from "@/components/Map";
import { SUBMISSION_AREA_LABEL } from "@/lib/siteConfig";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: places } = await supabase
    .from("places")
    .select("*")
    .eq("status", "approved");

  const approvedPlaces: Place[] = places ?? [];

  return (
    <main className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* 注意バナー */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800">
        ⚠️ 掲載情報はユーザーの主観的な体験談です。正確性を保証しません。
        <span className="ml-2">対象エリア: {SUBMISSION_AREA_LABEL}</span>
        <Link href="/guidelines" className="underline ml-2">投稿ガイドライン</Link>
        <Link href="/terms" className="underline ml-2">免責事項</Link>
      </div>

      {/* マップ */}
      <div className="flex-1 relative">
        <Map places={approvedPlaces} />

        {/* 統計オーバーレイ */}
        <div className="absolute bottom-6 left-4 z-10 bg-white/90 border border-gray-200 rounded-lg px-3 py-2 shadow text-xs text-gray-600">
          掲載勤務先: <span className="font-bold text-gray-900">{approvedPlaces.length}</span> 件
          <Link href="/list" className="ml-3 text-blue-600 hover:underline">一覧で見る →</Link>
        </div>
      </div>
    </main>
  );
}
