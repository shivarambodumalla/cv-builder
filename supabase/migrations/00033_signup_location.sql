-- Signup-derived location (separate from user-editable profile.location / profile.country)
alter table profiles add column if not exists signup_city text;
alter table profiles add column if not exists signup_region text;
alter table profiles add column if not exists signup_country text;
alter table profiles add column if not exists signup_country_code text;
alter table profiles add column if not exists signup_ip text;
alter table profiles add column if not exists signup_location_captured_at timestamptz;
