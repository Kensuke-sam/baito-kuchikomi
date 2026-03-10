-- ============================================================
-- 005: 原子的レート制限 check + record
--      pg_advisory_xact_lock で ip+action_type ごとに直列化
-- ============================================================

create or replace function check_and_record_rate_limit(
  p_ip          text,
  p_action_type text,
  p_limit       int     default 5,
  p_window_secs int     default 3600
)
returns jsonb
language plpgsql
security definer
as $$
declare
  lock_key  bigint;
  cnt       int;
  allowed   boolean;
begin
  -- ip || action_type からハッシュ値を生成してアドバイザリロックキーにする
  lock_key := abs(hashtext(p_ip || ':' || p_action_type));

  -- トランザクション終了まで同一 key の並行実行をブロック
  perform pg_advisory_xact_lock(lock_key);

  -- 古いレコードをついでに削除（パフォーマンス最適化）
  delete from submission_rate_limits
  where ip          = p_ip
    and action_type = p_action_type
    and created_at  < now() - (p_window_secs || ' seconds')::interval;

  -- 直近ウィンドウの件数をカウント
  select count(*) into cnt
  from submission_rate_limits
  where ip          = p_ip
    and action_type = p_action_type
    and created_at  > now() - (p_window_secs || ' seconds')::interval;

  allowed := cnt < p_limit;

  -- 許可された場合のみ記録
  if allowed then
    insert into submission_rate_limits (ip, action_type)
    values (p_ip, p_action_type);
  end if;

  return jsonb_build_object(
    'allowed',     allowed,
    'remaining',   greatest(p_limit - cnt - case when allowed then 1 else 0 end, 0),
    'limit',       p_limit,
    'window_secs', p_window_secs
  );
end;
$$;

-- Supabase RPC として anon/authenticated ロールから呼び出せるように許可
grant execute on function check_and_record_rate_limit(text, text, int, int) to anon, authenticated;
