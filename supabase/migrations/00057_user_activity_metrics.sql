-- C1 (audit): DAU / WAU / MAU + stickiness from user_activity.
--
-- Definitions:
--   "Engaged" = the user did something with intent — opened the editor, ran
--   ATS, ran a job match, downloaded a PDF, applied to a job, etc. We
--   exclude passive impressions (popover_shown:*, popover_dismiss:*) so the
--   numbers reflect product usage, not just telemetry firing.
--
-- Stickiness = engaged DAU / engaged MAU. 20%+ is industry-decent;
-- 50%+ is exceptional.

create or replace view public.user_activity_metrics as
with engaged as (
  select user_id, created_at
    from public.user_activity
   where user_id is not null
     and event not like 'popover_%'
     and event <> 'page_view'
)
select
  -- Engaged
  count(distinct user_id) filter (where created_at > now() - interval '24 hours')  as dau,
  count(distinct user_id) filter (where created_at > now() - interval '7 days')    as wau,
  count(distinct user_id) filter (where created_at > now() - interval '30 days')   as mau,
  round(
    100.0
    * count(distinct user_id) filter (where created_at > now() - interval '24 hours')
    / nullif(count(distinct user_id) filter (where created_at > now() - interval '30 days'), 0),
    1
  ) as stickiness_pct
from engaged;

-- Visiting (any activity row, including passive) — useful for reach, not engagement.
create or replace view public.user_activity_metrics_visiting as
select
  count(distinct user_id) filter (where created_at > now() - interval '24 hours')  as dau,
  count(distinct user_id) filter (where created_at > now() - interval '7 days')    as wau,
  count(distinct user_id) filter (where created_at > now() - interval '30 days')   as mau
from public.user_activity
where user_id is not null;

-- 30-day daily series (engaged) — for trend charts.
create or replace view public.user_activity_daily as
select
  date_trunc('day', created_at)::date as day,
  count(distinct user_id)             as dau
from public.user_activity
where user_id is not null
  and event not like 'popover_%'
  and event <> 'page_view'
  and created_at > now() - interval '30 days'
group by 1
order by 1 desc;

grant select on public.user_activity_metrics          to service_role;
grant select on public.user_activity_metrics_visiting to service_role;
grant select on public.user_activity_daily            to service_role;
