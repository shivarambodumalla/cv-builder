-- Reviews are now the published rows of `feedback` itself (status =
-- 'published', can_publish, comment), read by lib/feedback/reviews.ts with the
-- author's name, role and photo joined live from profiles. The separate
-- testimonials copy and the link column to it are gone.
-- Run AFTER the deploy that stops reading feedback.testimonial_id.
DROP TABLE IF EXISTS public.testimonials CASCADE;
ALTER TABLE public.feedback DROP COLUMN IF EXISTS testimonial_id;
