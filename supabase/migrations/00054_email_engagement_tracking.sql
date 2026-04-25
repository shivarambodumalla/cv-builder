-- Email engagement tracking. Resend's webhook posts email.delivered /
-- email.opened / email.clicked events to /api/webhooks/resend; today we
-- only consume bounces and complaints. These columns + bump_email_event()
-- let the webhook record those engagement events against the original send.
--
-- resend_id is the Resend message id captured at send time (data.id from
-- resend.emails.send) — the join key the webhook uses to find the row.

alter table public.email_logs
  add column if not exists resend_id    text,
  add column if not exists delivered_at timestamptz,
  add column if not exists opened_at    timestamptz,
  add column if not exists open_count   integer not null default 0,
  add column if not exists clicked_at   timestamptz,
  add column if not exists click_count  integer not null default 0;

create index if not exists idx_email_logs_resend_id on public.email_logs(resend_id);

-- Atomic event-bumper. Done in SQL so concurrent webhook deliveries can't
-- lose a count via a read-modify-write race in JS.
create or replace function public.bump_email_event(
  p_resend_id text,
  p_event     text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_resend_id is null or p_resend_id = '' then
    return;
  end if;

  if p_event = 'delivered' then
    update public.email_logs
       set delivered_at = coalesce(delivered_at, now())
     where resend_id = p_resend_id;
  elsif p_event = 'opened' then
    update public.email_logs
       set opened_at  = coalesce(opened_at, now()),
           open_count = open_count + 1
     where resend_id = p_resend_id;
  elsif p_event = 'clicked' then
    update public.email_logs
       set clicked_at  = coalesce(clicked_at, now()),
           click_count = click_count + 1
     where resend_id = p_resend_id;
  end if;
end;
$$;

revoke all on function public.bump_email_event(text, text) from public;
grant execute on function public.bump_email_event(text, text) to service_role;
