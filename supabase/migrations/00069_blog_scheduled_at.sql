alter table blog_posts add column if not exists scheduled_at timestamptz;

create index if not exists blog_posts_scheduled_idx
  on blog_posts (scheduled_at)
  where is_published = false and scheduled_at is not null;
