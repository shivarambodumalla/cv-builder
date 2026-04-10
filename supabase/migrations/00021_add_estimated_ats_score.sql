-- Add estimated ATS score to cvs table for dashboard display
ALTER TABLE public.cvs ADD COLUMN IF NOT EXISTS estimated_ats_score integer;
