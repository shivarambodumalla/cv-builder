create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  brief text,
  content_md text,
  content_html text,
  cover_image_url text,
  tags text[] default '{}',
  seo_title text,
  seo_description text,
  author_name text default 'CVEdge',
  read_time_minutes int default 5,
  is_published boolean default false,
  published_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table blog_posts enable row level security;

-- Public can read published posts
create policy "published posts are public"
  on blog_posts for select
  using (is_published = true);

-- Admins can do everything (checked via service role in API routes)

create index blog_posts_slug_idx on blog_posts (slug);
create index blog_posts_published_idx on blog_posts (is_published, published_at desc);

-- Auto-update updated_at
create or replace function set_blog_posts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_blog_posts_updated_at();
