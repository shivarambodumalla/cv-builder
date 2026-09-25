-- Post-download feedback: real 1-5 ratings collected from users after they
-- export a PDF, via an in-app prompt and a next-day email. These are the only
-- numbers allowed to feed an AggregateRating on the marketing pages, and only
-- once enough exist to be shown on the page (lib/feedback/stats.ts).

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cv_id uuid,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  source text NOT NULL DEFAULT 'popup' CHECK (source IN ('popup', 'email')),
  can_publish boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'published', 'archived')),
  testimonial_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own feedback" ON public.feedback FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role feedback" ON public.feedback FOR ALL USING (auth.role() = 'service_role');
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);

-- Drives the next-day feedback email (app/api/cron/feedback-request).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_pdf_download_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS feedback_email_sent_at timestamptz;
