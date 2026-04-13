-- Weekly limits v2: new counters + reset tracking

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fix_all_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_tailor_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS offer_eval_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_scan_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS story_summary_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interview_prep_this_week integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS week_reset_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS limit_emails_sent jsonb DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_limit_email_sent boolean DEFAULT false;
