-- CV Review RLS policies
-- Run this after 00059_cv_review_tables.sql

CREATE POLICY "user_own_reviews" ON cv_reviews FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_own_review_files" ON cv_review_files FOR ALL
  USING (review_id IN (SELECT id FROM cv_reviews WHERE user_id = auth.uid()));

CREATE POLICY "user_own_messages" ON cv_review_messages FOR ALL
  USING (review_id IN (SELECT id FROM cv_reviews WHERE user_id = auth.uid()));

CREATE POLICY "user_own_suggestions" ON cv_review_suggestions FOR SELECT
  USING (review_id IN (SELECT id FROM cv_reviews WHERE user_id = auth.uid()));

CREATE POLICY "user_own_notifications" ON cv_review_notifications FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "admin_all_reviews" ON cv_reviews FOR ALL USING (true);
CREATE POLICY "admin_all_review_files" ON cv_review_files FOR ALL USING (true);
CREATE POLICY "admin_all_messages" ON cv_review_messages FOR ALL USING (true);
CREATE POLICY "admin_all_suggestions" ON cv_review_suggestions FOR ALL USING (true);
CREATE POLICY "admin_all_notifications" ON cv_review_notifications FOR ALL USING (true);
