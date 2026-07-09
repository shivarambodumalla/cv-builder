-- Public uploads create a pending CV row before the user signs in.
-- The row is later claimed and attached to a real user_id after login.
alter table public.cvs
  alter column user_id drop not null;