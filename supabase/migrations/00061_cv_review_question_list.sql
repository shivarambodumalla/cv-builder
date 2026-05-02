-- Add question_list message type for interactive questionnaires
ALTER TABLE cv_review_messages DROP CONSTRAINT IF EXISTS cv_review_messages_message_type_check;
ALTER TABLE cv_review_messages ADD CONSTRAINT cv_review_messages_message_type_check
  CHECK (message_type IN ('text','suggestion_list','summary','file_request','final_feedback','question_list'));
