ALTER TABLE public.ats_reports ADD COLUMN IF NOT EXISTS report_data jsonb;
ALTER TABLE public.ats_reports ADD COLUMN IF NOT EXISTS overall_score int;
ALTER TABLE public.ats_reports ADD COLUMN IF NOT EXISTS confidence text;
