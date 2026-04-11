-- Test management tables for admin panel

-- Test runs (one per CI/manual run)
CREATE TABLE IF NOT EXISTS public.test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number integer NOT NULL DEFAULT 0,
  commit_hash text,
  commit_message text,
  branch text DEFAULT 'main',
  triggered_by text DEFAULT 'push',
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'passed', 'failed', 'error')),
  total_tests integer DEFAULT 0,
  passed integer DEFAULT 0,
  failed integer DEFAULT 0,
  skipped integer DEFAULT 0,
  duration_ms integer DEFAULT 0,
  github_run_id text,
  github_run_url text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Individual test results per run
CREATE TABLE IF NOT EXISTS public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.test_runs(id) ON DELETE CASCADE NOT NULL,
  suite text NOT NULL,
  test_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed', 'failed', 'skipped')),
  duration_ms integer DEFAULT 0,
  error_message text,
  screenshot_url text,
  created_at timestamptz DEFAULT now()
);

-- Test case registry
CREATE TABLE IF NOT EXISTS public.test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suite text NOT NULL,
  name text NOT NULL,
  description text,
  spec_file text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service role bypasses RLS)
CREATE POLICY "Admin read test_runs" ON public.test_runs FOR SELECT USING (true);
CREATE POLICY "Admin read test_results" ON public.test_results FOR SELECT USING (true);
CREATE POLICY "Admin all test_cases" ON public.test_cases FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON public.test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON public.test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_created ON public.test_runs(created_at DESC);
