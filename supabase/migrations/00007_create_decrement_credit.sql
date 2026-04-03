create or replace function public.decrement_credit(user_id uuid, credit_column text)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  execute format(
    'update public.profiles set %I = greatest(%I - 1, 0) where id = $1',
    credit_column, credit_column
  ) using user_id;
end;
$$;
