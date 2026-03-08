# バイト体験談マップ

アルバイト・パートの体験談（主観）を地図で共有できる口コミプラットフォーム。
管理者承認制・削除申請対応・監査ログ付きのリーガルリスク低減設計。

## ローカル起動手順

### 1. 依存パッケージをインストール

```bash
npm install
```

### 2. 環境変数を設定

```bash
cp .env.example .env.local
# .env.local を編集して各キーを設定
```

### 3. Supabase のセットアップ

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. Authentication > URL Configuration > Redirect URLs に `http://localhost:3000/auth/callback` を追加
3. SQL Editor で `supabase/migrations/001_initial.sql` を実行
4. Authentication > Users で管理者ユーザーを作成
5. SQL Editor で管理者を登録:
   ```sql
   insert into admins (user_id) values ('管理者のユーザーID');
   ```

### 4. 開発サーバー起動

```bash
npm run dev
```

→ http://localhost:3000 で確認

---

## ページ構成

| URL | 説明 |
|-----|------|
| `/` | マップビュー（承認済み勤務先ピン） |
| `/list` | 体験談一覧 |
| `/places/[id]` | 勤務先詳細・体験談・当事者コメント |
| `/submit` | 体験談投稿フォーム（管理者承認制） |
| `/takedown` | 削除申請フォーム |
| `/report` | 通報フォーム |
| `/official-response` | 当事者コメント送信 |
| `/guidelines` | 投稿ガイドライン |
| `/terms` | 利用規約・免責事項 |
| `/admin` | 管理ダッシュボード（要ログイン） |
| `/admin/reviews` | 体験談承認キュー |
| `/admin/places` | 勤務先承認キュー |
| `/admin/reports` | 通報一覧 |
| `/admin/takedowns` | 削除申請一覧 |

---

## 技術スタック

- **フロント**: Next.js 15 App Router + TypeScript + Tailwind CSS
- **DB/Auth**: Supabase (PostgreSQL + Row Level Security)
- **地図**: Mapbox GL JS
- **バリデーション**: Zod
- **デプロイ**: Vercel

---

## セキュリティ設計

| 項目 | 実装 |
|------|------|
| XSS対策 | HTML タグ除去 + React 自動エスケープ |
| Rate Limit | IP ベース（投稿: 10分5件、削除申請: 1時間5件） |
| RLS | `approved` のみ一般公開、管理者は service_role |
| 監査ログ | 承認/却下/削除操作をすべて `audit_logs` に記録 |
| IPログ | 投稿者 IP・UA を DB に保存（非公開・開示対応のため保持） |

---

## Vercel デプロイ

```bash
npx vercel
# 環境変数は Vercel ダッシュボード > Settings > Environment Variables で設定
```

---

## 管理者を追加する方法

1. Supabase Authentication > Users でユーザー作成
2. SQL Editor で挿入:
   ```sql
   insert into admins (user_id, role) values ('<user_id>', 'admin');
   ```
