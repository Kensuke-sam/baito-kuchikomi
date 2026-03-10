-- ============================================================
-- 006: レート制限メタデータ返却
-- ============================================================

create or replace function check_and_record_rate_limit(
  p_ip          text,
  p_action_type text,
  p_limit       int default 5,
  p_window_secs int default 3600
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
  oldest_created_at timestamptz;
  now_ts timestamptz := now();
  reset_at_ts timestamptz;
begin
  if p_ip is null or p_ip = '' or p_action_type is null or p_action_type = '' then
    reset_at_ts := now_ts + (p_window_secs || ' seconds')::interval;
    return jsonb_build_object(
      'allowed', true,
      'remaining', greatest(p_limit - 1, 0),
      'retry_after', greatest(1, p_window_secs),
      'reset_at', floor(extract(epoch from reset_at_ts))::bigint
    );
  end if;

  perform pg_advisory_xact_lock(
    hashtext(p_ip),
    hashtext(p_action_type)
  );

  select count(*), min(created_at)
    into cnt, oldest_created_at
    from submission_rate_limits
   where ip = p_ip
     and action_type = p_action_type
     and created_at > now_ts - (p_window_secs || ' seconds')::interval;

  if cnt >= p_limit then
    reset_at_ts := coalesce(
      oldest_created_at + (p_window_secs || ' seconds')::interval,
      now_ts + (p_window_secs || ' seconds')::interval
    );

    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after', greatest(1, ceil(extract(epoch from (reset_at_ts - now_ts)))::int),
      'reset_at', floor(extract(epoch from reset_at_ts))::bigint
    );
  end if;

  insert into submission_rate_limits (ip, action_type)
  values (p_ip, p_action_type);

  cnt := cnt + 1;
  if oldest_created_at is null then
    oldest_created_at := now_ts;
  end if;
  reset_at_ts := oldest_created_at + (p_window_secs || ' seconds')::interval;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(p_limit - cnt, 0),
    'retry_after', greatest(1, ceil(extract(epoch from (reset_at_ts - now_ts)))::int),
    'reset_at', floor(extract(epoch from reset_at_ts))::bigint
  );
end;
$$;
