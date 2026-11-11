-- guarantee_claims was never created in production (00029 didn't run), so
-- POST /api/guarantee/claim has been failing with "Failed to submit claim".
-- Don't run 00029 now: its "Service role claims" policy has no TO clause, so
-- it would also apply to anon (00078 removed those everywhere). This creates
-- the same table with the safe policy set: the service role bypasses RLS, and
-- a signed-in user can read only their own claims.

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

DROP POLICY IF EXISTS "Service role claims" ON public.guarantee_claims;
DROP POLICY IF EXISTS "Users own claims" ON public.guarantee_claims;
CREATE POLICY "Users own claims" ON public.guarantee_claims
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_guarantee_claims_user ON public.guarantee_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_guarantee_claims_status ON public.guarantee_claims(status);
