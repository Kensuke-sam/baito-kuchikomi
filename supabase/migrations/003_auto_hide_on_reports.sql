-- ============================================================
-- 自動非表示 + 重複通報防止
-- ============================================================
-- 同じ IP から同じ対象への通報を1回のみ許可する
-- (reporter_ip, target_type, target_id) のユニークインデックス
-- ============================================================

create unique index if not exists idx_reports_unique_per_ip
  on reports (reporter_ip, target_type, target_id)
  where reporter_ip is not null;

-- ============================================================
-- 通報が3件以上になったら自動で status を 'pending' に戻す
-- （管理者の再確認キューに入れる）
-- ============================================================

create or replace function auto_hide_on_report()
returns trigger language plpgsql security definer as $$
declare
  report_count int;
  target_table text;
begin
  -- 対象レビュー/勤務先への通報件数をカウント
  select count(*) into report_count
    from reports
   where target_type = new.target_type
     and target_id   = new.target_id;

  -- 3件以上なら approved → pending に変更（管理者レビュー待ちへ）
  if report_count >= 3 then
    if new.target_type = 'review' then
      update reviews
         set status = 'pending'
       where id = new.target_id
         and status = 'approved';
    elsif new.target_type = 'place' then
      update places
         set status = 'pending'
       where id = new.target_id
         and status = 'approved';
    end if;
  end if;

  return new;
end;
$$;

-- トリガー: reports に INSERT された後に自動実行
drop trigger if exists trg_auto_hide_on_report on reports;
create trigger trg_auto_hide_on_report
  after insert on reports
  for each row
  execute function auto_hide_on_report();
