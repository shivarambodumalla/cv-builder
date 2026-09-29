-- Career Path Finder (/career-path): one row per generated result.
--
-- Rows are created anonymously (user_id null) and attached to the visitor on
-- Google sign-in (claimed_at). `result` holds the full AI output; the API
-- decides what each viewer sees (preview for anyone, full plan for the owner),
-- so the lock is enforced server-side.
--
-- `input_hash` keys role-mode results by normalised input (role, years bucket,
-- preferences, country) so repeat inputs within 7 days copy an earlier result
-- instead of calling the AI. Every visitor still gets their own row.
--
-- All reads and writes go through createAdminClient() (service role bypasses
-- RLS). The only policy lets a signed-in user read their own rows; there is
-- deliberately no anon policy and no FOR ALL policy (see migration 00078).

CREATE TABLE IF NOT EXISTS public.career_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_id uuid REFERENCES public.cvs(id) ON DELETE SET NULL,
  source text NOT NULL CHECK (source IN ('role', 'resume')),
  -- Quoted: CURRENT_ROLE is a reserved word in Postgres. PostgREST quotes
  -- identifiers, so supabase-js selects it as plain `current_role`.
  "current_role" text NOT NULL,
  years_experience int,
  preferences text[] NOT NULL DEFAULT '{}',
  country text NOT NULL DEFAULT 'us',
  input_hash text,
  result jsonb NOT NULL,
  selected_role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_career_paths_user ON public.career_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_input_hash ON public.career_paths(input_hash, created_at DESC);

ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own career paths" ON public.career_paths;
CREATE POLICY "Users read own career paths" ON public.career_paths
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
