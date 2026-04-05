-- Add job description fields to cvs table
ALTER TABLE public.cvs ADD COLUMN IF NOT EXISTS job_description text;
ALTER TABLE public.cvs ADD COLUMN IF NOT EXISTS job_company text;
ALTER TABLE public.cvs ADD COLUMN IF NOT EXISTS job_title_target text;

-- Add report_data to job_matches
ALTER TABLE public.job_matches ADD COLUMN IF NOT EXISTS report_data jsonb;

-- Add tone and version to cover_letters
ALTER TABLE public.cover_letters ADD COLUMN IF NOT EXISTS tone text default 'professional';
ALTER TABLE public.cover_letters ADD COLUMN IF NOT EXISTS version int default 1;
