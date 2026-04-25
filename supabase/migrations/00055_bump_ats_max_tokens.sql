-- Bump ats_analysis max_tokens 4096 -> 8192. Low-scoring CVs produce
-- 6-category reports with many issues + keywords + enhancements that
-- exceed 4096, causing mid-string truncation and JSON parse failures.

update public.ai_settings
set max_tokens = 8192,
    updated_at = now()
where feature = 'ats_analysis'
  and max_tokens < 8192;
