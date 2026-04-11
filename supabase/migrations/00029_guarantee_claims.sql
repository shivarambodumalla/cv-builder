CREATE TABLE IF NOT EXISTS public.guarantee_claims (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cv_id uuid,
  current_score integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'refunded')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolution text
);

ALTER TABLE public.guarantee_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own claims" ON public.guarantee_claims FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role claims" ON public.guarantee_claims FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_guarantee_claims_user ON public.guarantee_claims(user_id);
