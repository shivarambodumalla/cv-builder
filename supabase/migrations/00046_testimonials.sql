-- Testimonials managed via admin panel, displayed on homepage
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  company text NOT NULL,
  gradient text DEFAULT 'from-pink-500 to-yellow-400',
  avatar_bg text DEFAULT 'bg-rose-100',
  sort_order integer DEFAULT 0,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read for enabled testimonials (homepage needs this without auth)
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (enabled = true);

-- Service role can do everything
CREATE POLICY "service_all_testimonials" ON testimonials FOR ALL USING (true);

-- Seed initial testimonials
INSERT INTO testimonials (quote, name, role, company, gradient, avatar_bg, sort_order) VALUES
(
  'My ATS score went from 58 to 92 in under 10 minutes. I got 3 interview callbacks within a week of updating my CV. It''s a tool I rely on every day.',
  'Priya Sharma',
  'Senior Software Engineer',
  'Google',
  'from-pink-500 to-yellow-400',
  'bg-rose-100',
  1
),
(
  'Most of my interviews I get now, I get thanks to CVEdge. Out of 10 applications, 7 are landing callbacks with CVEdge, which is highly accurate so I don''t need anything else.',
  'James Chen',
  'Product Manager',
  'Meta',
  'from-fuchsia-500 to-cyan-400',
  'bg-fuchsia-100',
  2
),
(
  'Before CVEdge we were not able to get past ATS filters. With CVEdge we now pass 40-50% of automated screens. We chose CVEdge because we could easily fix the issues.',
  'Sarah Mitchell',
  'Data Scientist',
  'Amazon',
  'from-yellow-400 to-lime-400',
  'bg-amber-100',
  3
),
(
  'The hardest part of job hunting is tailoring your CV for each role. Now with CVEdge, my match rate is up 4X from 5% to 20%. It completely changed my approach.',
  'Marcus Johnson',
  'DevOps Engineer',
  'Netflix',
  'from-pink-500 to-violet-500',
  'bg-violet-100',
  4
),
(
  'The AI rewrite feature is incredible. It turned my vague bullet points into measurable achievements without making anything up. Best CV tool I''ve ever used.',
  'Emily Rodriguez',
  'UX Designer',
  'Apple',
  'from-cyan-400 to-blue-500',
  'bg-cyan-100',
  5
),
(
  'As a career changer, I had no idea what keywords to use. CVEdge mapped my transferable skills perfectly to tech roles and I landed my dream job in 3 weeks.',
  'Daniel Kim',
  'Frontend Developer',
  'Stripe',
  'from-lime-400 to-emerald-500',
  'bg-emerald-100',
  6
),
(
  'I''ve been in recruiting for 12 years. CVEdge catches the same things our ATS filters for. I now recommend it to every candidate I work with.',
  'Rachel Foster',
  'Senior Recruiter',
  'Microsoft',
  'from-orange-400 to-pink-500',
  'bg-orange-100',
  7
),
(
  'The Fix All feature rewrote my entire CV in one click and my score jumped 25 points. I was speechless. Went from zero callbacks to 4 interviews in a week.',
  'Nina Patel',
  'Marketing Manager',
  'Salesforce',
  'from-violet-500 to-fuchsia-400',
  'bg-purple-100',
  8
);
