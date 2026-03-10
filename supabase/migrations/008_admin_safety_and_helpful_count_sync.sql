-- ============================================================
-- 008: 管理者権限の安全な更新 + helpful_count 同期
-- ============================================================

alter table places
  add column if not exists admin_notes text;

alter table reviews
  add column if not exists admin_notes text;

alter table audit_logs
  drop constraint if exists audit_logs_admin_id_fkey;

alter table audit_logs
  add constraint audit_logs_admin_id_fkey
  foreign key (admin_id)
  references admins(user_id)
  on delete set null;

create or replace function update_admin_role_safely(
  p_user_id uuid,
  p_next_role admin_role
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_admin admins%rowtype;
  super_admin_count int;
begin
  perform pg_advisory_xact_lock(hashtext('admin_role_management'));

  select *
    into target_admin
    from admins
   where user_id = p_user_id
   for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'error_code', 'not_found'
    );
  end if;

  if target_admin.role = p_next_role then
    return jsonb_build_object(
      'ok', true,
      'previous_role', target_admin.role,
      'next_role', target_admin.role
    );
  end if;

  if target_admin.role = 'super_admin' and p_next_role <> 'super_admin' then
    select count(*)
      into super_admin_count
      from admins
     where role = 'super_admin';

    if super_admin_count <= 1 then
      return jsonb_build_object(
        'ok', false,
        'error_code', 'last_super_admin'
      );
    end if;
  end if;

  update admins
     set role = p_next_role
   where user_id = p_user_id;

  return jsonb_build_object(
    'ok', true,
    'previous_role', target_admin.role,
    'next_role', p_next_role
  );
end;
$$;

create or replace function revoke_admin_safely(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_admin admins%rowtype;
  admin_count int;
  super_admin_count int;
begin
  perform pg_advisory_xact_lock(hashtext('admin_role_management'));

  select *
    into target_admin
    from admins
   where user_id = p_user_id
   for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'error_code', 'not_found'
    );
  end if;

  select count(*)
    into admin_count
    from admins;

  if admin_count <= 1 then
    return jsonb_build_object(
      'ok', false,
      'error_code', 'last_admin'
    );
  end if;

  if target_admin.role = 'super_admin' then
    select count(*)
      into super_admin_count
      from admins
     where role = 'super_admin';

    if super_admin_count <= 1 then
      return jsonb_build_object(
        'ok', false,
        'error_code', 'last_super_admin'
      );
    end if;
  end if;

  delete from admins
   where user_id = p_user_id;

  return jsonb_build_object(
    'ok', true,
    'previous_role', target_admin.role
  );
end;
$$;

revoke all on function update_admin_role_safely(uuid, admin_role) from public, anon, authenticated;
grant execute on function update_admin_role_safely(uuid, admin_role) to service_role;

revoke all on function revoke_admin_safely(uuid) from public, anon, authenticated;
grant execute on function revoke_admin_safely(uuid) to service_role;

create or replace function sync_review_helpful_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_review_id uuid := coalesce(new.review_id, old.review_id);
begin
  update reviews
     set helpful_count = (
       select count(*)::int
         from review_helpful_votes
        where review_id = target_review_id
     )
   where id = target_review_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_review_helpful_count on review_helpful_votes;
create trigger trg_sync_review_helpful_count
  after insert or delete on review_helpful_votes
  for each row
  execute function sync_review_helpful_count();

update reviews
set helpful_count = vote_counts.count
from (
  select reviews.id as review_id, count(review_helpful_votes.id)::int as count
  from reviews
  left join review_helpful_votes
    on review_helpful_votes.review_id = reviews.id
  group by reviews.id
) as vote_counts
where reviews.id = vote_counts.review_id;
