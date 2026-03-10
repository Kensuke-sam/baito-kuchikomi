-- ============================================================
-- 004: レート制限 & 勤務先投稿改善
-- ============================================================

-- 1. submission_rate_limits テーブル
create table if not exists submission_rate_limits (
  id          uuid primary key default uuid_generate_v4(),
  ip          text not null,
  action_type text not null,
  created_at  timestamptz not null default now()
);

alter table submission_rate_limits enable row level security;

create index if not exists idx_rate_limits_ip_action
  on submission_rate_limits (ip, action_type, created_at);

-- 2. レート制限チェック関数
create or replace function check_rate_limit(
  p_ip          text,
  p_action_type text,
  p_limit       int default 5,
  p_window_secs int default 3600
)
returns boolean
language plpgsql
security definer
as $$
declare
  cnt int;
begin
  select count(*) into cnt
  from submission_rate_limits
  where ip          = p_ip
    and action_type = p_action_type
    and created_at  > now() - (p_window_secs || ' seconds')::interval;
  return cnt < p_limit;
end;
$$;

-- 3. 古いレート制限レコード削除関数
create or replace function cleanup_rate_limits()
returns void
language plpgsql
security definer
as $$
begin
  delete from submission_rate_limits
  where created_at < now() - interval '2 hours';
end;
$$;

-- 4. places に submission_token カラム追加
alter table places
  add column if not exists submission_token text;

create unique index if not exists idx_places_submission_token
  on places (submission_token)
  where submission_token is not null;

-- 5. reviews に submission_token カラム追加
alter table reviews
  add column if not exists submission_token text;

create unique index if not exists idx_reviews_submission_token
  on reviews (submission_token)
  where submission_token is not null;

-- 6. places INSERT ポリシー更新
drop policy if exists "public_insert_places" on places;
create policy "public_insert_places" on places
  for insert
  with check (
    status = 'pending'
    and lat is not null
    and lng is not null
    and name <> ''
    and address <> ''
  );

-- 7. reviews INSERT ポリシー更新
drop policy if exists "public_insert_reviews" on reviews;
create policy "public_insert_reviews" on reviews
  for insert
  with check (
    status = 'pending'
    and body <> ''
    and title <> ''
  );
