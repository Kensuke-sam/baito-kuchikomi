# baito-review.com / バイト体験談マップ

大学生向けの「ブラックバイト・危険バイト回避」情報サイトです。
口コミだけでなく、`guides` `jobs` `areas` `apps` のハブ構造を使って、検索流入から問題解決記事へ入り、そこから口コミ比較や求人アフィリエイトへつなぐ設計にしています。

この README は 2 つの用途を兼ねています。

1. 開発者向けのセットアップ手順
2. 運営者向けの収益化・SEO・安全運用の手順

## サイトの目的

- ブラックバイトや危険求人を避けたい人に、主観レビューと実践ガイドを提供する
- 大学生が「今のバイトを辞めたい」「単発でつなぎたい」「次の候補を探したい」ときの判断材料を作る
- 検索流入を集めて、求人アフィリエイトを主軸に収益化する
- 断定的な悪評を避け、削除申請・当事者コメント・管理者承認を前提に運営する

## 現在の実装範囲

### ユーザー向けページ

- `/` トップページ
- `/guides` 問題解決ガイド一覧
- `/guides/[slug]` 問題解決記事詳細
- `/jobs` 職種別ハブ
- `/jobs/[slug]` 職種別詳細
- `/areas` 地域別ハブ
- `/areas/[slug]` 地域別詳細
- `/apps` 単発・求人サービス比較ハブ
- `/apps/[slug]` 単発・求人サービス詳細
- `/list` 口コミ一覧
- `/places/[id]` 勤務先詳細
- `/submit` 体験談投稿
- `/guidelines` 投稿ガイドライン
- `/about` サイトについて
- `/editorial-policy` 編集方針
- `/terms` 利用規約・免責事項
- `/privacy` プライバシーポリシー
- `/report` 通報フォーム
- `/takedown` 削除申請フォーム
- `/official-response` 当事者コメント送信フォーム

### 管理者向けページ

- `/admin/login`
- `/admin/places`
- `/admin/reviews`
- `/admin/reports`
- `/admin/takedowns`
- `/admin/official-responses`

### 収益化とSEOの土台

- `guides / jobs / areas / apps` の内部リンク構造
- 提携リンク用の環境変数切り替え
- PR表記コンポーネント
- GA4 / GTM 用の計測受け皿
- 外部CTAクリック時の `affiliate_click` イベント送信
- `Article` / `Breadcrumb` の構造化データ
- `sitemap.xml`
- フォーム系ページへの `noindex,follow`

## 技術スタック

| 項目 | 内容 |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Database / Auth | Supabase |
| Map | Mapbox / react-map-gl / Leaflet |
| Mail | Resend |
| Hosting | Vercel 想定 |
| Analytics | GA4 直接埋め込み or GTM 経由 |

## リポジトリ構成

```text
app/
  admin/                  管理画面
  api/                    投稿・通報・削除申請・管理API
  apps/                   単発・求人サービス比較
  areas/                  地域別ハブ
  guides/                 SEO記事ハブ
  jobs/                   職種別ハブ
  list/                   口コミ一覧
  official-response/      当事者コメント
  places/[id]/            勤務先詳細
  privacy/                プライバシーポリシー
  report/                 通報フォーム
  submit/                 投稿フォーム
  takedown/               削除申請フォーム
components/
  Analytics.tsx           GA4 / GTM の読み込み
  ActionSpotlight.tsx     CTAカード
  GuideCta.tsx            ガイド用CTA
  PromotionNotice.tsx     PR表記
  TrackedCtaLink.tsx      外部CTA計測
lib/
  guides.ts               ガイドデータ
  hubs.ts                 jobs / areas / apps データ
  partnerLinks.ts         提携リンクの切り替え
  siteConfig.ts           投稿対象エリア判定
  supabase/               Supabase クライアント
supabase/migrations/      スキーマ
```

## 環境変数

`.env.example` を `.env.local` にコピーして使います。

```bash
cp .env.example .env.local
```

### 必須

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 公開キー |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理用キー。公開しない |
| `NEXT_PUBLIC_SITE_URL` | 本番URL |

### 任意だが推奨

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | 地図・Geocoding |
| `RESEND_API_KEY` | 管理通知メール |
| `RESEND_FROM_EMAIL` | 送信元メール |
| `ADMIN_NOTIFICATION_EMAIL` | 管理通知先 |

### 投稿対象エリア

投稿対象は日本国内で固定です。
判定は `lib/siteConfig.ts` に持たせており、環境変数では上書きしません。

### 提携リンク

未設定時は内部ページへ遷移します。
提携URLを入れると、自動で外部アフィリエイトリンクに切り替わります。

| 変数名 | 想定用途 |
|---|---|
| `NEXT_PUBLIC_PARTNER_SINGLE_DAY_JOBS_URL` | 単発・スキマバイト案件 |
| `NEXT_PUBLIC_PARTNER_PART_TIME_JOBS_URL` | 総合バイト求人案件 |
| `NEXT_PUBLIC_PARTNER_CAREER_URL` | 働き方見直し系の導線 |

### 計測

GTM を使うなら `NEXT_PUBLIC_GTM_ID` を優先します。
最短で始めるなら `NEXT_PUBLIC_GA_MEASUREMENT_ID` だけで十分です。

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_GTM_ID` | GTM コンテナID |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (`G-XXXXXXXXXX`) |

## ローカル開発

### 1. 依存関係を入れる

```bash
npm install
```

### 2. Supabase をセットアップする

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. `Authentication > URL Configuration` を開く
3. 以下を設定する

| 項目 | 値 |
|---|---|
| Site URL | `https://baito-review.com` |
| Redirect URL | `http://localhost:3000/auth/callback` |
| Redirect URL | `https://baito-review.com/auth/callback` |
| Redirect URL | `https://www.baito-review.com/auth/callback` |

4. `supabase/migrations` の SQL を順に実行する
5. `Authentication > Users` で管理者ユーザーを作る
6. SQL Editor で `admins` テーブルに登録する

```sql
insert into admins (user_id, role) values ('<user_id>', 'admin');
```

### 3. 開発サーバーを立ち上げる

```bash
npm run dev
```

`http://localhost:3000` で確認できます。

### 4. 本番ビルド確認

```bash
npm run build
```

## Vercel デプロイ手順

### GitHub 連携

1. GitHub にこのリポジトリを push
2. [Vercel Dashboard](https://vercel.com/dashboard) を開く
3. `Add New...` → `Project`
4. このリポジトリを選ぶ
5. Framework は `Next.js`
6. `Deploy`

### ドメイン設定

1. Vercel プロジェクトを開く
2. `Settings`
3. `Domains`
4. `baito-review.com` を追加
5. `www.baito-review.com` も追加
6. `baito-review.com` を Primary Domain にする

### 環境変数の入れ方

1. プロジェクトを開く
2. `Settings`
3. `Environment Variables`
4. `Add New`
5. Name / Value / Environment を入力
6. `Save`
7. `Deployments` から `Redeploy`

Vercel公式でも、環境変数変更後は再デプロイが必要です。

### 最低限入れる本番環境変数

| 変数名 | 必須 |
|---|---:|
| `NEXT_PUBLIC_SITE_URL=https://baito-review.com` | 必須 |
| `NEXT_PUBLIC_SUPABASE_URL` | 必須 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 必須 |
| `SUPABASE_SERVICE_ROLE_KEY` | 必須 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 推奨 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | 推奨 |
| `RESEND_API_KEY` | 推奨 |

## GA4 をつなぐ手順

最短ルートは **GA4直挿し** です。
まずは GTM ではなく `NEXT_PUBLIC_GA_MEASUREMENT_ID` を使う方が簡単です。

### 手順

1. [Google Analytics](https://analytics.google.com/) を開く
2. `管理`
3. `プロパティを作成`
4. Web データストリームを追加
5. `https://baito-review.com` を登録
6. `G-XXXXXXXXXX` の Measurement ID を取得
7. Vercel の `Settings > Environment Variables` で以下を追加

| Name | Value |
|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` |

8. `Deployments` から `Redeploy`
9. GA4 の `リアルタイム` で自分のアクセスが見えるか確認

### クリック計測

外部CTAは `affiliate_click` イベントを送る実装です。
見たい項目は次の 3 つです。

| パラメータ | 意味 |
|---|---|
| `link_url` | クリックしたリンク |
| `link_text` | ボタン文言 |
| `placement` | どのページ・位置のCTAか |

## Search Console の設定手順

### 1. プロパティ追加

1. [Google Search Console](https://search.google.com/search-console/about) を開く
2. `プロパティを追加`
3. 推奨は `ドメイン` プロパティ
4. `baito-review.com` を入力
5. DNS の TXT レコードで確認

### 2. サイトマップ送信

1. 左メニューの `サイトマップ`
2. `sitemap.xml` を入力
3. `送信`

### 3. 送信後に見る場所

| 画面 | 何を見るか |
|---|---|
| `サイトマップ` | 成功したか、検出URL数はあるか |
| `URL検査` | 主要ページが読めるか |
| `検索結果` | 表示回数が増えているか |
| `ページ` / `インデックス` | 除外や未登録が多すぎないか |
| `手動による対策` | 警告が出ていないか |
| `セキュリティの問題` | 問題なしになっているか |

### 最初に検査するURL

- `https://baito-review.com/`
- `https://baito-review.com/guides`
- `https://baito-review.com/guides/baito-yametai-daigakusei`
- `https://baito-review.com/guides/black-baito-miwakekata`
- `https://baito-review.com/guides/tanpatsu-baito-app-hikaku`

## A8.net で案件を選ぶ基準

このサイトは、**高単価より読者との相性** を優先します。

### 最初に探すジャンル

| 優先 | ジャンル |
|---|---|
| 1 | 単発・スキマバイト |
| 2 | 総合アルバイト求人 |
| 3 | 日払い・短期 |

### A8 での画面の流れ

1. [A8.net](https://www.a8.net/) にログイン
2. `プログラム検索`
3. `単発バイト` `スキマバイト` `求人` で検索
4. 案件詳細を開く
5. `提携申請`

### 選定基準

| 項目 | 見るポイント |
|---|---|
| 成果条件 | 登録 or 応募など軽めか |
| 否認条件 | 厳しすぎないか |
| 読者との相性 | 大学生・単発需要に合うか |
| 審査難度 | 即時提携 or 通りやすいか |
| 広告素材 | テキストリンクが使えるか |

### 最初に避ける案件

- 成果条件が重すぎる
- 読者とズレている
- 否認条件が厳しすぎる
- LP が弱い
- 記事に自然に置けない

### 提携URLを入れる場所

承認後、Vercel の環境変数へ入れます。

| 変数名 | 入れるURL |
|---|---|
| `NEXT_PUBLIC_PARTNER_SINGLE_DAY_JOBS_URL` | 単発・スキマ系 |
| `NEXT_PUBLIC_PARTNER_PART_TIME_JOBS_URL` | 総合求人系 |
| `NEXT_PUBLIC_PARTNER_CAREER_URL` | 働き方見直し系 |

## SEO と noindex の方針

### 現在インデックスさせるページ

- トップ
- guides 一覧・詳細
- jobs 一覧・詳細
- areas 一覧・詳細
- apps 一覧・詳細
- list
- places 詳細
- about
- editorial-policy
- guidelines
- terms
- privacy

### noindex にしているページ

- `/submit`
- `/report`
- `/takedown`
- `/official-response`

理由は、フォームUI中心で検索流入価値が低く、インデックス品質を落としやすいためです。

## 記事と収益導線の考え方

### 集客記事

- ブラックバイトの見分け方
- バイトを辞めたい大学生向け
- 単発バイトアプリ比較

### 送客先

```text
検索
  ↓
guides
  ↓
jobs / apps / areas
  ↓
外部提携リンク
```

### ページ内の役割

| ページ | 役割 |
|---|---|
| `guides` | 集客と問題解決 |
| `jobs` | 職種単位の比較 |
| `areas` | 地域単位の比較 |
| `apps` | CVに近い比較ページ |
| `list` / `places` | 信頼補強と回遊 |

## 運用フロー

### 毎週やること

- Search Console の `検索結果` を確認
- 表示回数が伸びた記事を見る
- CTA のクリックが出ているか確認
- 承認待ちの投稿・通報・削除申請を処理

### 毎月やること

- 上位表示候補の記事をリライト
- 空ページや薄いページを見直す
- 提携案件の差し替え候補を確認
- PR表記や法務ページの記載を見直す

## 安全運用の原則

| 項目 | 方針 |
|---|---|
| 投稿内容 | 主観レビューとして扱う |
| 公開方式 | 管理者承認後に公開 |
| 表現 | 断定・個人特定を避ける |
| 問題発生時 | 通報・削除申請・当事者コメント導線を使う |
| 証跡 | IP / UA / タイムスタンプ等を内部保存 |

この README は一般的な運用方針であり、法的助言ではありません。
公開運用前には、必要に応じて専門家確認を入れてください。

## 公開前チェックリスト

- [ ] Supabase の URL / Redirect が本番ドメインに合っている
- [ ] Vercel の環境変数が入っている
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` または `NEXT_PUBLIC_GTM_ID` が入っている
- [ ] `sitemap.xml` を Search Console に送信した
- [ ] 主要3記事を URL 検査した
- [ ] A8 で 3 件以上提携申請した
- [ ] PR表記が外部提携リンクページに出る
- [ ] フォーム系ページが `noindex` になっている
- [ ] 削除申請と当事者コメント導線が動く
- [ ] `npm run build` が通る

## よく使うコマンド

```bash
npm install
npm run dev
npm run build
npm run start
```

## 参考リンク

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Google Analytics Help](https://support.google.com/analytics/)
- [Google Search Console Help](https://support.google.com/webmasters/)
- [Google Search Central](https://developers.google.com/search/docs)
- [A8.net ヘルプ](https://support.a8.net/a8/as/)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
