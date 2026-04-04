alter table public.ats_reports
  add column if not exists report_data jsonb,
  add column if not exists overall_score int,
  add column if not exists confidence text;
