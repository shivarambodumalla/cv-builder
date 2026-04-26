-- A2 (audit): backfill design_settings.templatePicked = true for every existing CV.
--
-- Context: until now, /resume/[id] would render even if the user never went
-- through /pick-template, which silently dumped them into the default
-- "classic" template. The new gate in app/(editor)/resume/[id]/page.tsx now
-- redirects to the picker when templatePicked !== true. Without this
-- backfill, every returning user with a pre-existing CV would suddenly be
-- bounced back to the picker on their next open — even though they've been
-- editing happily for weeks.
--
-- Treating every existing CV as "picked" is the safe call: if they didn't
-- want classic, they would have switched already; either way they don't
-- deserve a paywall-feeling re-prompt. New CVs continue to land in the
-- picker via the existing upload / create-blank flow.

update public.cvs
   set design_settings = jsonb_set(
         coalesce(design_settings, '{}'::jsonb),
         '{templatePicked}',
         'true'::jsonb,
         true
       )
 where design_settings is null
    or (design_settings ->> 'templatePicked') is null
    or (design_settings ->> 'templatePicked') <> 'true';
