-- ============================================================
-- バイト体験談口コミプラットフォーム - 初期マイグレーション
-- ============================================================

-- 拡張機能
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUM 型
-- ============================================================
create type content_status as enum ('pending', 'approved', 'rejected', 'removed');
create type request_status  as enum ('received', 'investigating', 'resolved');
create type target_type     as enum ('place', 'review');
create type admin_role      as enum ('admin', 'super_admin');

-- ============================================================
-- 勤務先
-- ============================================================
create table places (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text not null,
  nearest_station text,
  lat         double precision not null,
  lng         double precision not null,
  area_tag    text,
  status      content_status not null default 'pending',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 体験談
-- ============================================================
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  place_id    uuid not null references places(id) on delete cascade,
  title       text not null,
  body        text not null,
  tags        text[] not null default '{}',
  period_from text,       -- 勤務期間（任意, 例: "2023年春"）
  period_to   text,
  status      content_status not null default 'pending',
  -- 監査用（公開しない）
  author_token text,       -- クライアント生成のランダムID（ブラウザに保持）
  author_ip    text,
  author_ua    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 通報
-- ============================================================
create table reports (
  id           uuid primary key default uuid_generate_v4(),
  target_type  target_type not null,
  target_id    uuid not null,
  reason       text not null,
  detail       text,
  reporter_ip  text,
  reporter_ua  text,
  status       request_status not null default 'received',
  admin_notes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 削除申請
-- ============================================================
create table takedown_requests (
  id             uuid primary key default uuid_generate_v4(),
  target_url     text not null,
  contact_name   text not null,
  contact_email  text not null,
  reason         text not null,
  detail         text,
  evidence_url   text,
  status         request_status not null default 'received',
  admin_notes    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ============================================================
-- 当事者コメント（公式反論）
-- ============================================================
create table official_responses (
  id        uuid primary key default uuid_generate_v4(),
  place_id  uuid not null references places(id) on delete cascade,
  body      text not null,
  status    content_status not null default 'pending',
  -- 監査用
  sender_ip text,
  sender_ua text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 管理者
-- ============================================================
create table admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 監査ログ
-- ============================================================
create table audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid references admins(user_id),
  action      text not null,   -- 'approve_review', 'reject_review', 'delete_place', etc.
  target_type text,
  target_id   uuid,
  detail      jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- updated_at トリガー
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_places_updated_at
  before update on places
  for each row execute function set_updated_at();

create trigger trg_reviews_updated_at
  before update on reviews
  for each row execute function set_updated_at();

create trigger trg_reports_updated_at
  before update on reports
  for each row execute function set_updated_at();

create trigger trg_takedowns_updated_at
  before update on takedown_requests
  for each row execute function set_updated_at();

create trigger trg_official_responses_updated_at
  before update on official_responses
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table places            enable row level security;
alter table reviews           enable row level security;
alter table reports           enable row level security;
alter table takedown_requests enable row level security;
alter table official_responses enable row level security;
alter table admins            enable row level security;
alter table audit_logs        enable row level security;

-- ---- places ----
-- 一般ユーザー: approved のみ読み取り可
create policy "public_read_places" on places
  for select using (status = 'approved');

-- INSERT は誰でも可（pending として作成）
create policy "public_insert_places" on places
  for insert with check (status = 'pending');

-- UPDATE/DELETE は service_role のみ（RLSをバイパス）
-- ※ service_role キーを使うAPIルートで操作する

-- ---- reviews ----
create policy "public_read_reviews" on reviews
  for select using (status = 'approved');

create policy "public_insert_reviews" on reviews
  for insert with check (status = 'pending');

-- ---- reports ----
-- 閲覧不可（管理者のみ service_role で読む）
create policy "public_insert_reports" on reports
  for insert with check (true);

-- ---- takedown_requests ----
create policy "public_insert_takedowns" on takedown_requests
  for insert with check (true);

-- ---- official_responses ----
create policy "public_read_official_responses" on official_responses
  for select using (status = 'approved');

create policy "public_insert_official_responses" on official_responses
  for insert with check (status = 'pending');

-- ---- admins ----
-- 一般ユーザーはアクセス不可（service_role のみ）

-- ---- audit_logs ----
-- service_role のみ

-- ============================================================
-- インデックス
-- ============================================================
create index idx_reviews_place_id   on reviews(place_id);
create index idx_reviews_status     on reviews(status);
create index idx_places_status      on places(status);
create index idx_reports_target     on reports(target_type, target_id);
create index idx_official_place_id  on official_responses(place_id);
