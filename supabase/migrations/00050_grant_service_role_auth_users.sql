-- Migration 00048 recreated user_profile_enriched with security_invoker = true,
-- so the view's joins now run as the calling role (service_role for the admin
-- panel) instead of the view owner. service_role does not have SELECT on
-- auth.users by default, which made the join return nothing and left the
-- admin users page empty.
grant usage on schema auth to service_role;
grant select on auth.users to service_role;
