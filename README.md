# バイト体験談マップ

アルバイト・パートの体験談を「主観の口コミ」として共有する、地図つきの口コミプラットフォームです。  
管理者承認制、削除申請、当事者コメント、内部ログ保持を前提に、公開運用しやすいMVPとして構成しています。

## 設計方針

### ページ構成

- `/` : 承認済み勤務先のマップ表示
- `/list` : 口コミ一覧とタグ検索
- `/places/[id]` : 勤務先詳細、承認済み口コミ、当事者コメント
- `/submit` : 勤務先登録 + 口コミ投稿
- `/report` : 一般ユーザー向け通報フォーム
- `/takedown` : 当事者・企業向け削除申請フォーム
- `/official-response` : 当事者コメント送信フォーム
- `/guidelines` : 投稿ガイドライン
- `/terms` : 利用規約・免責事項
- `/admin/*` : 承認・非公開化・要修正・削除対応の管理画面

### DB 設計

- `places` : 勤務先情報。`approved` のみ公開
- `reviews` : 勤務先に紐づく体験談。IP/UA/内部識別子を保存
- `reports` : 一般ユーザーの通報
- `takedown_requests` : 削除申請
- `official_responses` : 当事者コメント
- `admins` : 管理者ユーザー
- `audit_logs` : 管理操作の監査ログ

### RLS 方針

- 一般ユーザーは `approved` の `places` / `reviews` / `official_responses` のみ閲覧可能
- 一般ユーザーの書き込みは `pending` または専用受付テーブルに限定
- 管理画面は `service_role` を使うサーバー側 API 経由で操作

### 管理フロー

- 新規勤務先・体験談・当事者コメントは `pending`
- 管理者は `approved` / `rejected` / `needs_revision` / `removed` を操作
- 通報と削除申請は `received` / `investigating` / `resolved`
- 管理操作は `audit_logs` に記録
- 削除申請・通報・当事者コメントは Resend で管理者へ通知可能

## 実装タスク

1. 地図・一覧・詳細ページを実装
2. 口コミ投稿と勤務先新規登録のフローを実装
3. 通報、削除申請、当事者コメントの受付を実装
4. 管理画面と承認フローを実装
5. RLS、Rate Limit、サニタイズ、監査ログを実装
6. 利用規約、投稿ガイドライン、免責を整備
7. Vercel / Supabase / Mapbox / Resend 向けの環境変数と README を整備

## リポジトリ構成

```text
app/
  admin/                  管理画面
  api/                    投稿・通報・削除申請・管理 API
  places/[id]/            勤務先詳細
  submit/                 投稿フォーム
  report/                 通報フォーム
  takedown/               削除申請フォーム
  official-response/      当事者コメント送信
components/
  admin/                  管理 UI 部品
  Map.tsx                 地図表示
  ReviewCard.tsx          口コミカード
lib/
  adminAuth.ts            管理者認証
  adminNotes.ts           管理メモ取得
  notifications.ts        Resend 通知
  rateLimit.ts            インメモリ Rate Limit
  sanitize.ts             テキストサニタイズ
  siteConfig.ts           エリア制限設定
  supabase/               Supabase クライアント
supabase/migrations/      スキーマ定義・追加マイグレーション
```

## 環境変数

`.env.example` を `.env.local` にコピーして設定します。

### 必須

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_SITE_URL`

### 任意だが本番推奨

- `NEXT_PUBLIC_SUBMISSION_AREA_LABEL`
- `NEXT_PUBLIC_ALLOWED_MIN_LAT`
- `NEXT_PUBLIC_ALLOWED_MAX_LAT`
- `NEXT_PUBLIC_ALLOWED_MIN_LNG`
- `NEXT_PUBLIC_ALLOWED_MAX_LNG`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_NOTIFICATION_EMAIL`

## ローカル起動手順

### 1. 依存パッケージ

```bash
npm install
```

### 2. 環境変数

```bash
cp .env.example .env.local
```

### 3. Supabase セットアップ

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. Authentication > URL Configuration > Redirect URLs に `http://localhost:3000/auth/callback` を追加
3. SQL Editor で `supabase/migrations/001_initial.sql` と `supabase/migrations/002_revision_workflow.sql` を順に実行
4. Authentication > Users で管理者ユーザーを作成
5. SQL Editor で管理者を登録

```sql
insert into admins (user_id, role) values ('<user_id>', 'admin');
```

### 4. 開発サーバー

```bash
npm run dev
```

`http://localhost:3000` で確認できます。

## セキュリティ・運用

| 項目 | 実装 |
|------|------|
| 投稿表現の中立化 | 投稿フォーム・ガイドラインで主観表現を明示 |
| 事前審査 | すべての口コミ・勤務先・当事者コメントを承認制 |
| 削除対応 | 削除申請フォームと管理ステータス |
| 当事者対応 | 当事者コメント送信 + 管理者掲載 |
| Rate Limit | IP ベース |
| XSS 対策 | HTML タグ除去 + React エスケープ |
| ログ保持 | IP / UA / 作成時刻 / 監査ログを内部保存 |
| エリア制限 | 環境変数で投稿可能範囲を制御 |

## デプロイ

Vercel を前提にしています。

```bash
npx vercel
```

本番環境では以下を必ず確認してください。

- Vercel にすべての環境変数を設定
- Supabase の Redirect URL と Site URL を本番ドメインへ変更
- Mapbox の許可ドメインを本番ドメインに制限
- Resend の送信ドメイン認証を完了
- 管理者アカウントを 2 名以上で運用
- 削除申請と通報の通知先メールが有効

## 公開前チェック

- 利用規約・投稿ガイドライン・免責の文面を運用方針に合わせて見直す
- 削除申請の一次対応 SLA を決める
- 管理画面を毎日確認する運用を決める
- 開示請求や問い合わせの受け口メールを用意する
- 必要に応じて専門家レビューを受ける
