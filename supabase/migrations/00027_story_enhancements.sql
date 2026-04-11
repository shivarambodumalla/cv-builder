-- Story enhancements: reflection, summary, framework, seniority

ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS reflection text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS framework text DEFAULT 'star';
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS seniority_context text DEFAULT 'auto';
