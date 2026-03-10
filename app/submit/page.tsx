"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { REVIEW_TAGS } from "@/lib/types";
import { readErrorMessage } from "@/lib/http";
import { isWithinSubmissionArea } from "@/lib/siteConfig";
import LocationPreviewMap from "@/components/LocationPreviewMap";

const PROHIBITED_PATTERNS = [/詐欺/, /犯罪/, /逮捕/, /違法/];

type GeocodeResult =
  | { ok: true; lat: number; lng: number; provider: "mapbox" | "nominatim" }
  | { ok: false; error: string };

const inputClass = "field-input text-sm text-[var(--page-ink)] placeholder:text-gray-400";
const textareaClass = "field-textarea text-sm leading-7 text-[var(--page-ink)] placeholder:text-gray-400";

function hasProhibitedContent(text: string): boolean {
  return PROHIBITED_PATTERNS.some((re) => re.test(text));
}

function createSubmissionToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "";
}

function SubmitPageInner() {
  const searchParams = useSearchParams();
  const preselectedPlaceId = searchParams.get("place_id");

  const [step, setStep] = useState<"place" | "review">(preselectedPlaceId ? "review" : "place");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [placeName, setPlaceName] = useState("");
  const [placeAddress, setPlaceAddress] = useState("");
  const [placeStation, setPlaceStation] = useState("");
  const [placeId, setPlaceId] = useState(preselectedPlaceId ?? "");
  const [placeSubmissionToken] = useState(createSubmissionToken);
  const [reviewSubmissionToken] = useState(createSubmissionToken);
  const [geocoding, setGeocoding] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [locationSource, setLocationSource] = useState<"geocode" | "manual" | null>(null);
  const [locationProvider, setLocationProvider] = useState<"mapbox" | "nominatim" | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");

  const [prohibitedWarning, setProhibitedWarning] = useState(false);
  useEffect(() => {
    setProhibitedWarning(hasProhibitedContent(body) || hasProhibitedContent(title));
  }, [body, title]);

  const trimmedAddress = placeAddress.trim();
  const hasResolvedLocation = lat !== null && lng !== null && trimmedAddress.length > 0 && resolvedAddress === trimmedAddress;
  const isResolvedInArea = hasResolvedLocation ? isWithinSubmissionArea(lat, lng) : null;

  function clearResolvedLocation() {
    setLat(null);
    setLng(null);
    setResolvedAddress("");
    setLocationSource(null);
    setLocationProvider(null);
  }

  async function geocode(address: string): Promise<GeocodeResult> {
    setGeocoding(true);

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        return {
          ok: false,
          error: await readErrorMessage(response, "住所確認に失敗しました。しばらくしてから再試行してください。"),
        };
      }

      const data: { ok?: boolean; lat?: number; lng?: number; provider?: "mapbox" | "nominatim" } = await response.json();
      if (data.ok === true && typeof data.lat === "number" && typeof data.lng === "number") {
        return { ok: true, lat: data.lat, lng: data.lng, provider: data.provider ?? "nominatim" };
      }

      return {
        ok: false,
        error: "住所確認に失敗しました。しばらくしてから再試行してください。",
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

  async function resolveAddressLocation() {
    const address = trimmedAddress;
    if (!address) {
      setError("住所を入力してください。");
      return null;
    }

    if (hasResolvedLocation && lat !== null && lng !== null) {
      return {
        ok: true as const,
        lat,
        lng,
        provider: locationProvider ?? "nominatim",
      };
    }

    const result = await geocode(address);
    if (!result.ok) {
      clearResolvedLocation();
      setError(result.error);
      return null;
    }

    setLat(result.lat);
    setLng(result.lng);
    setResolvedAddress(address);
    setLocationSource("geocode");
    setLocationProvider(result.provider);

    return result;
  }

  async function handleAddressPreview() {
    setError("");
    const result = await resolveAddressLocation();
    if (!result) return;

    if (!isWithinSubmissionArea(result.lat, result.lng)) {
      setError("位置は確認できましたが、日本国内の勤務先のみ受け付けています。");
    }
  }

  function handleAddressChange(value: string) {
    setPlaceAddress(value);
    if (resolvedAddress && value.trim() !== resolvedAddress) {
      clearResolvedLocation();
    }
  }

  function handleMapLocationPick(nextLat: number, nextLng: number) {
    setLat(nextLat);
    setLng(nextLng);
    setResolvedAddress(trimmedAddress);
    setLocationSource("manual");
    setError("");
  }

  async function handlePlaceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!placeName || !placeAddress) {
      setError("勤務先名と住所は必須です。");
      return;
    }

    const result = await resolveAddressLocation();
    if (!result) {
      return;
    }

    if (!isWithinSubmissionArea(result.lat, result.lng)) {
      setError("現在は日本国内の勤務先のみ投稿できます。");
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
      let resolvedPlaceId = placeId;
      if (!resolvedPlaceId) {
        if (lat === null || lng === null) {
          throw new Error("先に勤務先の住所確認を完了してください。");
        }

        const placeRes = await fetch("/api/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: placeName,
            address: placeAddress,
            nearest_station: placeStation,
            lat,
            lng,
            submission_token: placeSubmissionToken || undefined,
          }),
        });

        if (!placeRes.ok) {
          throw new Error(await readErrorMessage(placeRes, "勤務先の登録に失敗しました。"));
        }

        const placeData: { ok?: boolean; id: string; existing?: boolean } = await placeRes.json();
        resolvedPlaceId = placeData.id;
        setPlaceId(placeData.id);
      }

      const reviewRes = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: resolvedPlaceId,
          title,
          body,
          submission_token: reviewSubmissionToken || undefined,
          tags,
          period_from: periodFrom,
          period_to: periodTo,
        }),
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

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  }

  if (success) {
    return (
      <main className="app-shell mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <section className="section-frame p-8 text-center sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a,#2563eb)] text-3xl text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)]">
            ✓
          </div>
          <p className="mt-6">
            <span className="eyebrow">投稿完了</span>
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
            投稿を受け付けました
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--page-muted)]">
            勤務先と体験談は管理者確認後に公開されます。通常は 1〜3 営業日以内に反映します。公開前に、個人情報や断定的な表現がないかも確認します。
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-sm font-semibold text-[var(--page-ink)]">公開されない情報</p>
              <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
                IP アドレスやユーザーエージェントなどの内部ログは公開しません。
              </p>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-sm font-semibold text-[var(--page-ink)]">掲載までの流れ</p>
              <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
                主観レビューとして読める形かを確認してから公開します。
              </p>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-sm font-semibold text-[var(--page-ink)]">問題があるとき</p>
              <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
                公開後の連絡先として削除申請フォームと当事者コメント窓口を用意しています。
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="primary-button text-sm">
              トップへ戻る
            </Link>
            <Link href="/list" className="secondary-button text-sm">
              一覧を見る
            </Link>
            <Link href="/guidelines" className="secondary-button text-sm">
              投稿ガイドライン
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="section-frame flex h-fit flex-col gap-6 p-6 lg:sticky lg:top-24">
          <div>
            <span className="eyebrow">匿名で投稿</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--page-ink)]">
              体験談を投稿する
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--page-muted)]">
              勤務先の登録と体験談の投稿をまとめて受け付けます。掲載前に管理者が確認し、断定表現や個人情報は公開しません。IP アドレスやユーザーエージェントは不正対策のため内部保存し、公開ページには表示しません。
            </p>
          </div>

          <div className="space-y-3">
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
                安心材料 1
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--page-ink)]">公開前に確認</p>
              <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
                投稿はすぐ公開されず、主観レビューとして読める内容かを確認してから掲載します。
              </p>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
                安心材料 2
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--page-ink)]">公開しない情報</p>
              <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
                IP アドレス、ユーザーエージェント、内部識別子は不正対策のため保存しますが、公開ページには出しません。
              </p>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--page-muted)]">
                安心材料 3
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--page-ink)]">問題があるときの窓口</p>
              <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
                公開後に問題がある場合は、削除申請フォームと当事者コメントフォームから連絡できます。
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-5">
            <p className="text-sm font-semibold text-[var(--page-ink)]">投稿前チェック</p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-[var(--page-muted)]">
              <p>・未払い・違法などは断定せず、見聞きした事実と感想を分ける</p>
              <p>・個人名、電話番号、SNS アカウントは書かない</p>
              <p>・日本国外の勤務先は受け付けない</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/guidelines" className="inline-flex text-sm font-semibold text-[var(--accent)] hover:opacity-80">
                詳細ガイドラインを見る →
              </Link>
              <Link href="/takedown" className="inline-flex text-sm font-semibold text-[var(--accent)] hover:opacity-80">
                削除申請フォーム →
              </Link>
            </div>
          </div>
        </aside>

        <section className="section-frame p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="soft-pill" data-active={step === "place"}>
              1. 勤務先登録
            </span>
            <span className="soft-pill" data-active={step === "review"}>
              2. 体験談入力
            </span>
            <span className="soft-pill">
              承認後に公開
            </span>
          </div>

          <div className="glass-panel rounded-[28px] p-5 text-sm text-[var(--page-muted)]">
            <p className="font-semibold text-[var(--page-ink)]">掲載ポリシー</p>
            <p className="mt-2 leading-7">
              ここはアルバイト体験談を共有する場です。投稿は主観レビューとして扱い、事実の断定や個人特定につながる記述は掲載しません。
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === "place" && (
            <form onSubmit={handlePlaceSubmit} className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
                  Step 1
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                  勤務先を登録
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">
                    勤務先名 *
                  </label>
                  <input
                    className={inputClass}
                    placeholder="例：○○チェーン 渋谷店"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">
                    住所 *（地図にピンを立てます）
                  </label>
                  <input
                    className={inputClass}
                    placeholder="例：東京都豊島区池袋2丁目"
                    value={placeAddress}
                    onChange={(e) => handleAddressChange(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">
                    最寄り駅（任意）
                  </label>
                  <input
                    className={inputClass}
                    placeholder="例：池袋駅 徒歩3分"
                    value={placeStation}
                    onChange={(e) => setPlaceStation(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="glass-panel rounded-[28px] p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
                          Location Preview
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--page-ink)]">
                          {hasResolvedLocation ? "この位置で勤務先を登録します" : "住所確認後に地図へピンを表示します"}
                        </p>
                        <p className="mt-1 text-xs leading-6 text-[var(--page-muted)]">
                          番地まで入れると精度が上がります。確認後は地図をクリックしてピン位置を微調整できます。
                        </p>
                      </div>
                      <span
                        className={
                          hasResolvedLocation
                            ? isResolvedInArea
                              ? "soft-pill"
                              : "inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600"
                            : "soft-pill"
                        }
                        data-active={hasResolvedLocation && isResolvedInArea ? true : undefined}
                      >
                        {hasResolvedLocation ? (isResolvedInArea ? "日本国内" : "受付対象外") : "未確認"}
                      </span>
                    </div>

                    <div className="mt-4 h-[280px] overflow-hidden rounded-[24px] border border-[var(--line)] bg-white">
                      <LocationPreviewMap
                        lat={lat}
                        lng={lng}
                        title={placeName}
                        address={trimmedAddress}
                        inSubmissionArea={isResolvedInArea}
                        interactive={hasResolvedLocation}
                        onPickLocation={handleMapLocationPick}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--page-muted)]">
                      {hasResolvedLocation ? (
                        <>
                          <span className="soft-pill">緯度 {lat?.toFixed(6)}</span>
                          <span className="soft-pill">経度 {lng?.toFixed(6)}</span>
                          <span className="soft-pill">
                            {locationSource === "manual"
                              ? "地図クリックで微調整済み"
                              : `住所照合: ${locationProvider === "mapbox" ? "Mapbox" : "Nominatim"}`}
                          </span>
                        </>
                      ) : (
                        <p>まだ位置が確定していません。「住所を地図で確認」を押すとこの欄にピンが出ます。</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAddressPreview}
                  disabled={geocoding || !trimmedAddress}
                  className="secondary-button flex-1 text-sm disabled:opacity-60"
                >
                  {geocoding ? "位置を確認中…" : "住所を地図で確認"}
                </button>
                <button type="submit" disabled={geocoding} className="primary-button flex-1 text-sm disabled:opacity-60">
                  {geocoding ? "位置を確認中…" : "次へ進む"}
                </button>
              </div>
            </form>
          )}

          {step === "review" && (
            <form onSubmit={handleReviewSubmit} className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--page-muted)]">
                  Step 2
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--page-ink)]">
                  体験談を入力
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="glass-panel rounded-[24px] p-4">
                  <p className="text-sm font-semibold text-[var(--page-ink)]">書きやすい順番</p>
                  <div className="mt-2 space-y-2 text-sm leading-7 text-[var(--page-muted)]">
                    <p>1. いつ、どのくらい働いたかを書く</p>
                    <p>2. 良かった点ときつかった点を分けて書く</p>
                    <p>3. どんな人に合いそうかをひと言添える</p>
                  </div>
                </div>
                <div className="glass-panel rounded-[24px] p-4">
                  <p className="text-sm font-semibold text-[var(--page-ink)]">短い例</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--page-muted)]">
                    「夕方はかなり忙しかったですが、研修は丁寧でした。テスト期間はシフト相談しやすく、接客に慣れたい人には向いていると感じました。」
                  </p>
                </div>
              </div>

              {!preselectedPlaceId && hasResolvedLocation && (
                <div className="glass-panel rounded-[24px] p-4 text-sm text-[var(--page-muted)]">
                  <p className="font-semibold text-[var(--page-ink)]">登録位置を確認済み</p>
                  <p className="mt-2 leading-7">
                    {placeName || "勤務先"} は地図上のピン位置で保存されます。位置を直したい場合は一度戻って再確認してください。
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">タイトル *</label>
                <input
                  className={inputClass}
                  placeholder="例：シフトの強要が辛かった体験"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-[var(--page-ink)]">
                  カテゴリ（複数選択可）
                </label>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="soft-pill transition-colors"
                      data-active={tags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">
                  体験談 *
                  <span className="ml-2 text-xs font-normal text-[var(--page-muted)]">
                    50文字以上 / 主観として記述
                  </span>
                </label>
                <textarea
                  className={textareaClass}
                  rows={7}
                  placeholder="体験したことを具体的に書いてください。「〜と感じた」「〜と思った」などの主観表現を使うと掲載しやすくなります。"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={3000}
                />
                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                  <span className={prohibitedWarning ? "text-red-600" : "text-[var(--page-muted)]"}>
                    {prohibitedWarning
                      ? "断定的な表現や禁止ワードが含まれている可能性があります。"
                      : "個人情報・断定表現は掲載できません。"}
                  </span>
                  <span className="text-[var(--page-muted)]">{body.length}/3000</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">
                    勤務開始（任意）
                  </label>
                  <input
                    className={inputClass}
                    placeholder="例：2023年春"
                    value={periodFrom}
                    onChange={(e) => setPeriodFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--page-ink)]">
                    勤務終了（任意）
                  </label>
                  <input
                    className={inputClass}
                    placeholder="例：2024年夏"
                    value={periodTo}
                    onChange={(e) => setPeriodTo(e.target.value)}
                  />
                </div>
              </div>

              <label className="glass-panel flex items-start gap-3 rounded-[24px] p-4 text-sm text-[var(--page-muted)]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 accent-blue-600"
                />
                <span className="leading-7">
                  <Link href="/guidelines" className="font-semibold text-[var(--accent)] hover:opacity-80">
                    投稿ガイドライン
                  </Link>
                  <span className="mx-1">および</span>
                  <Link href="/terms" className="font-semibold text-[var(--accent)] hover:opacity-80">
                    利用規約
                  </Link>
                  に同意します。投稿時の IP アドレスとユーザーエージェントは内部的に保存され、公開はされません。
                </span>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                {!preselectedPlaceId && (
                  <button type="button" onClick={() => setStep("place")} className="secondary-button flex-1 text-sm">
                    戻る
                  </button>
                )}
                <button type="submit" disabled={submitting || !agreed} className="primary-button flex-1 text-sm disabled:opacity-60">
                  {submitting ? "送信中…" : "投稿する"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10 text-sm text-[var(--page-muted)]">
          読み込み中…
        </main>
      }
    >
      <SubmitPageInner />
    </Suspense>
  );
}
