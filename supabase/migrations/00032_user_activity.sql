create table if not exists user_activity (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  event text not null,
  page text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_user_activity_user_id on user_activity(user_id);
create index if not exists idx_user_activity_created_at on user_activity(created_at desc);
create index if not exists idx_user_activity_user_created on user_activity(user_id, created_at desc);

alter table user_activity enable row level security;

-- Users can insert their own events (silent; API handles failures)
create policy "users insert own activity"
  on user_activity for insert
  with check (user_id = auth.uid());

-- Users can read their own events (safe default)
create policy "users read own activity"
  on user_activity for select
  using (user_id = auth.uid());

-- Admin reads happen via service-role key (createAdminClient), bypassing RLS.
