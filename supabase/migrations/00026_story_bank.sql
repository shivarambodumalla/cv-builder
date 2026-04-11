-- Interview Story Bank tables

CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  situation text,
  task text,
  action text,
  result text,
  tags text[] DEFAULT '{}',
  quality_score integer DEFAULT 0,
  source_type text DEFAULT 'manual' CHECK (source_type IN ('cv_bullet', 'url', 'pdf', 'manual', 'github', 'portfolio')),
  source_url text,
  source_cv_id uuid REFERENCES public.cvs(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.story_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('portfolio', 'github', 'url', 'pdf', 'cv')),
  url text,
  file_name text,
  last_scanned_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own stories" ON public.stories FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users own story_sources" ON public.story_sources FOR ALL USING (user_id = auth.uid());

-- Service role bypass (for API routes using admin client)
CREATE POLICY "Service role stories" ON public.stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role story_sources" ON public.story_sources FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_user ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_story_sources_user ON public.story_sources(user_id);
