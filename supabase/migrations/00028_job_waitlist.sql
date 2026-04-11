CREATE TABLE IF NOT EXISTS public.job_waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_waitlist_email ON public.job_waitlist(email);
