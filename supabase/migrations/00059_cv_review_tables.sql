-- CV Review service tables

CREATE TABLE IF NOT EXISTS cv_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('starter','standard','pro')),
  price_paid numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  target_role text,
  target_country text,
  user_notes text,
  admin_notes text,
  edit_rounds_used integer DEFAULT 0,
  edit_rounds_limit integer NOT NULL,
  lemon_squeezy_order_id text,
  last_notified_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS cv_review_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES cv_reviews ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text,
  file_type text CHECK (file_type IN ('pdf','docx')),
  file_size_bytes integer,
  version_number integer DEFAULT 1,
  uploaded_by text DEFAULT 'user' CHECK (uploaded_by IN ('user','admin')),
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_review_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES cv_reviews ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user','admin','system','ai')),
  message_type text NOT NULL CHECK (message_type IN ('text','suggestion_list','summary','file_request','final_feedback')),
  content jsonb NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_review_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES cv_reviews ON DELETE CASCADE,
  suggestion_text text NOT NULL,
  original_text text,
  improved_text text,
  reasoning text,
  ats_impact integer DEFAULT 0,
  confidence_score integer DEFAULT 0,
  status text DEFAULT 'pending_admin' CHECK (status IN ('pending_admin','accepted','rejected','needs_user_input')),
  pending_note text,
  section text,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_review_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES cv_reviews ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email','in_app','both')),
  sent_at timestamptz DEFAULT NOW(),
  read_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cv_reviews_user_id ON cv_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_reviews_status ON cv_reviews(status);
CREATE INDEX IF NOT EXISTS idx_cv_review_messages_review_id ON cv_review_messages(review_id);
CREATE INDEX IF NOT EXISTS idx_cv_review_suggestions_review_id ON cv_review_suggestions(review_id);
CREATE INDEX IF NOT EXISTS idx_cv_review_notifications_user_id ON cv_review_notifications(user_id);

-- RLS
ALTER TABLE cv_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_review_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_review_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_review_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_review_notifications ENABLE ROW LEVEL SECURITY;

-- Policies are in 00060_cv_review_policies.sql
