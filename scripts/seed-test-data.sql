-- Seed test user for E2E testing
-- Fixed UUIDs for consistency across test runs

-- Test profile (profiles table — no auth.users needed for test bypass)
INSERT INTO profiles (
  id, email, full_name, subscription_status, plan
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@cvedge.test',
  'Arjun Mehta',
  'active',
  'pro'
) ON CONFLICT (id) DO UPDATE SET
  subscription_status = 'active',
  plan = 'pro';

-- Test CV
INSERT INTO cvs (
  id, user_id, title, target_role, parsed_json, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Arjun-Mehta-Resume',
  'Senior ML Engineer',
  '{
    "contact": {"name": "Arjun Mehta", "email": "arjun@email.com", "phone": "+91 98400 12345", "location": "Bengaluru, India", "linkedin": "linkedin.com/in/arjunmehta", "website": ""},
    "targetTitle": {"title": "Senior ML Engineer"},
    "summary": {"content": "Senior AI/ML Engineer with 7 years of experience building and deploying large-scale machine learning systems at Google DeepMind and Flipkart."},
    "experience": {"items": [
      {"company": "Google DeepMind", "role": "Senior ML Engineer", "location": "Bengaluru, India", "startDate": "Jan 2021", "endDate": "", "isCurrent": true, "bullets": ["Led development of transformer-based ranking model improving CTR by 14%", "Built real-time feature pipeline processing 4.2B events/day", "Fine-tuned LLMs reducing reading time by 73% across 40,000 users"]},
      {"company": "Flipkart", "role": "ML Engineer", "location": "Bengaluru, India", "startDate": "Jul 2018", "endDate": "Dec 2020", "isCurrent": false, "bullets": ["Designed recommendation model increasing GMV by 380Cr", "Reduced model training time by 58% migrating to GCP"]}
    ]},
    "education": {"items": [{"institution": "IIT Bombay", "degree": "B.Tech", "field": "Computer Science", "startDate": "2012", "endDate": "2016"}]},
    "skills": {"categories": [{"name": "ML & AI", "skills": ["Python", "PyTorch", "TensorFlow", "LLMs", "NLP"]}, {"name": "Infrastructure", "skills": ["Kubernetes", "Docker", "AWS", "MLOps"]}]},
    "certifications": {"items": []},
    "awards": {"items": []},
    "projects": {"items": []},
    "volunteering": {"items": []},
    "publications": {"items": []},
    "sections": {"contact": true, "targetTitle": true, "summary": true, "experience": true, "education": true, "skills": true, "certifications": false, "awards": false, "projects": false, "volunteering": false, "publications": false}
  }',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  parsed_json = EXCLUDED.parsed_json,
  updated_at = NOW();

-- Seed JD on test CV
UPDATE cvs SET
  job_description = 'We are looking for a Senior ML Engineer to join our AI team. You will build and deploy large-scale recommendation systems using PyTorch and TensorFlow. Requirements: 5+ years ML experience, proficiency in Python, experience with MLOps, Kubernetes, and cloud platforms. Knowledge of CUDA and RLHF preferred. We offer competitive salary, health insurance, hybrid work (3 days office), and strong growth opportunities.',
  job_company = 'AI Corp',
  job_title_target = 'Senior ML Engineer'
WHERE id = '00000000-0000-0000-0000-000000000002';
