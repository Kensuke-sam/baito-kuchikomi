-- ============================================================
-- 007: 体験談の「役に立った」投票
-- ============================================================

alter table reviews
  add column if not exists helpful_count integer not null default 0;

create table if not exists review_helpful_votes (
  id          uuid primary key default uuid_generate_v4(),
  review_id   uuid not null references reviews(id) on delete cascade,
  voter_token text not null,
  created_at  timestamptz not null default now(),
  unique (review_id, voter_token)
);

alter table review_helpful_votes enable row level security;

create index if not exists idx_review_helpful_votes_review_id
  on review_helpful_votes (review_id, created_at desc);

update reviews
set helpful_count = vote_counts.count
from (
  select review_id, count(*)::int as count
  from review_helpful_votes
  group by review_id
) as vote_counts
where reviews.id = vote_counts.review_id;

update reviews
set helpful_count = 0
where helpful_count is null;
