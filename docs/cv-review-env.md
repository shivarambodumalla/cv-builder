# CV Review — Required Environment Variables

Add these to `.env.local` and Vercel Environment Variables:

```
# Lemon Squeezy product variant IDs for CV Review tiers
LS_CV_REVIEW_STARTER_VARIANT_ID=
LS_CV_REVIEW_STANDARD_VARIANT_ID=
LS_CV_REVIEW_PRO_VARIANT_ID=
```

## Setup Steps

1. In Lemon Squeezy dashboard, create 3 one-time products:
   - CV Review Starter — $14
   - CV Review Standard — $29
   - CV Review Pro — $49

2. Copy each product's variant ID into the env vars above.

3. Add the same vars to Vercel → Settings → Environment Variables.

4. Run seed scripts after deployment:
   ```bash
   npx tsx scripts/seed-cv-review-prompt.ts
   npx tsx scripts/seed-cv-review-emails.ts
   ```

5. In Supabase Storage, create a bucket named `cv-review-files`:
   - Public: false (private)
   - File size limit: 5MB
   - Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document

6. Add storage RLS policies (run in Supabase SQL editor):
   ```sql
   -- Users can upload to their review folder
   CREATE POLICY "user_upload_review_files"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'cv-review-files'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Users can read their own files
   CREATE POLICY "user_read_review_files"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'cv-review-files'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Service role (admin client) can read + write all
   -- (handled by service role key bypass)
   ```
