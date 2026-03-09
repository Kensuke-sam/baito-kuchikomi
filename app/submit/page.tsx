"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { REVIEW_TAGS } from "@/lib/types";
import { readErrorMessage } from "@/lib/http";
import { isWithinSubmissionArea } from "@/lib/siteConfig";

const PROHIBITED_PATTERNS = [
  /詐欺/,
  /犯罪/,
  /逮捕/,
  /違法/,
];

function hasProhibitedContent(text: string): boolean {
  return PROHIBITED_PATTERNS.some((re) => re.test(text));
}

type GeocodeResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; error: string };

function SubmitPageInner() {
  const searchParams = useSearchParams();
  const preselectedPlaceId = searchParams.get("place_id");

  const [step, setStep] = useState<"place" | "review">(preselectedPlaceId ? "review" : "place");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 勤務先フォーム
  const [placeName, setPlaceName] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");
  const [placeStation, setPlaceStation] = useState("");
  const [placeId, setPlaceId] = useState(preselectedPlaceId ?? "");
  const [geocoding, setGeocoding] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // 体験談フォーム
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");

  // 禁止チェック
  const [prohibitedWarning, setProhibitedWarning] = useState(false);
  useEffect(() => {
    setProhibitedWarning(hasProhibitedContent(body) || hasProhibitedContent(title));
  }, [body, title]);

  async function geocode(address: string): Promise<GeocodeResult> {
    setGeocoding(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        return {
          ok: false,
          error: "地図設定が未完了のため、住所確認ができません。",
        };
      }

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address + " 日本")}.json?access_token=${token}&language=ja&limit=1`
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return {
            ok: false,
            error: "地図設定に不備があるため、住所確認ができません。",
          };
        }
        if (res.status === 429) {
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

      const data: { features?: Array<{ center?: [number, number] }> } = await res.json();
      const center = data.features?.[0]?.center;
      if (Array.isArray(center) && center.length === 2) {
        const [lngVal, latVal] = center;
        setLat(latVal);
        setLng(lngVal);
        return { ok: true, lat: latVal, lng: lngVal };
      }

      return {
        ok: false,
        error: "住所を地図上で特定できませんでした。もう少し詳しく入力してください。",
      };
    } catch {
      return {
        ok: false,
        error: "住所確認に失敗しました。通信環境を確認して再試行してください。",
      };
    } finally {
      setGeocoding(false);
    }
  }

  async function handlePlaceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!placeName || !placeAddress) {
      setError("勤務先名と住所は必須です。");
      return;
    }

    const result = await geocode(placeAddress);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!isWithinSubmissionArea(result.lat, result.lng)) {
      setError("現在は対象エリア内のみ投稿できます。");
      return;
    }

    setStep("review");
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("投稿ガイドラインへの同意が必要です。");
      return;
    }
    if (!title || !body) {
      setError("タイトルと本文は必須です。");
      return;
    }
    if (body.length < 50) {
      setError("本文は50文字以上で入力してください。");
      return;
    }
    if (prohibitedWarning) {
      setError("禁止表現が含まれている可能性があります。内容を見直してください。");
      return;
    }

    setSubmitting(true);

    try {
      // 勤務先が未選択なら新規作成
      let resolvedPlaceId = placeId;
      if (!resolvedPlaceId) {
        if (lat === null || lng === null) {
          throw new Error("先に勤務先の住所確認を完了してください。");
        }

        const placeRes = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: placeName, address: placeAddress, nearest_station: placeStation, lat, lng }),
        });
        if (!placeRes.ok) {
          throw new Error(await readErrorMessage(placeRes, "勤務先の登録に失敗しました。"));
        }
        const placeData: { id: string } = await placeRes.json();
        resolvedPlaceId = placeData.id;
        setPlaceId(placeData.id);
      }

      const reviewRes = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: resolvedPlaceId, title, body, tags, period_from: periodFrom, period_to: periodTo }),
      });
      if (!reviewRes.ok) {
        throw new Error(await readErrorMessage(reviewRes, "投稿に失敗しました。"));
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">投稿を受け付けました</h1>
        <p className="text-sm text-gray-600 mb-6">
          管理者が確認後、公開されます。通常1〜3営業日以内に対応します。
        </p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">トップへ戻る</Link>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-2">体験談を投稿する</h1>

      {/* ガイドライン */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900 space-y-1">
        <p className="font-semibold">📋 投稿前にご確認ください</p>
        <p>・ここは体験談（主観）を共有する場所です。断定表現や個人特定は書かないでください。</p>
        <p>・未払い・違法などの断定は避け、事実として体験したことを時系列で書いてください。</p>
        <p>・個人名・電話番号・SNSアカウントなど個人を特定できる情報は記載禁止です。</p>
        <p>・対象外エリアの勤務先は受け付けていません。</p>
        <Link href="/guidelines" className="underline text-blue-700">詳細ガイドラインを見る →</Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STEP 1: 勤務先 */}
      {step === "place" && (
        <form onSubmit={handlePlaceSubmit} className="space-y-4">
          <h2 className="font-semibold text-gray-800">STEP 1: 勤務先を登録</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">勤務先名 *</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例：○○チェーン 渋谷店"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">住所 * （地図にピンを立てます）</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例：東京都豊島区池袋2丁目"
              value={placeAddress}
              onChange={(e) => setPlaceAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">最寄り駅（任意）</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例：池袋駅 徒歩3分"
              value={placeStation}
              onChange={(e) => setPlaceStation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={geocoding}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md text-sm"
          >
            {geocoding ? "住所を確認中…" : "次へ（体験談を入力）"}
          </button>
        </form>
      )}

      {/* STEP 2: 体験談 */}
      {step === "review" && (
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <h2 className="font-semibold text-gray-800">STEP 2: 体験談を入力</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例：シフトの強要が辛かった体験"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ（複数選択可）</label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setTags((prev) =>
                      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                    )
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    tags.includes(tag)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              体験談 * <span className="text-gray-400 font-normal">（50文字以上・主観として記述）</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              rows={6}
              placeholder="体験したことを具体的に書いてください。断定表現（〜だった/違法/詐欺 など）は避け、「〜と感じた」「〜と思った」などの主観表現で書いてください。"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={3000}
            />
            {prohibitedWarning && (
              <p className="text-xs text-red-600 mt-1">⚠️ 断定的な表現や禁止ワードが含まれている可能性があります。</p>
            )}
            <p className="text-xs text-gray-400 text-right">{body.length}/3000</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">勤務開始（任意）</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="例：2023年春"
                value={periodFrom}
                onChange={(e) => setPeriodFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">勤務終了（任意）</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="例：2024年夏"
                value={periodTo}
                onChange={(e) => setPeriodTo(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-blue-600"
            />
            <span>
              <Link href="/guidelines" className="text-blue-600 hover:underline">投稿ガイドライン</Link>
              および
              <Link href="/terms" className="text-blue-600 hover:underline ml-1">利用規約</Link>
              に同意します
            </span>
          </label>
          <p className="text-xs text-gray-500">
            投稿時のIPアドレス・ユーザーエージェントは内部的に保存します。これらは公開されません。
          </p>

          <div className="flex gap-3">
            {!preselectedPlaceId && (
              <button
                type="button"
                onClick={() => setStep("place")}
                className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-md text-sm hover:bg-gray-50"
              >
                ← 戻る
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || !agreed}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md text-sm"
            >
              {submitting ? "送信中…" : "投稿する（管理者確認後に公開）"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<main className="max-w-xl mx-auto px-4 py-8 text-sm text-gray-500">読み込み中…</main>}>
      <SubmitPageInner />
    </Suspense>
  );
}
