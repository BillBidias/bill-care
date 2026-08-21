-- P10 — User Profile Database Foundation (DRAFT — NOT APPLIED)
-- Target: bill-care-dev (DEV, ref ezwkeoapkmeftbbhdjua)
-- Scope: identity/profile infrastructure only. No health data, no roles,
-- no entitlements, no catalogue changes.

begin;

-- 0. Safety preconditions ---------------------------------------------------
do $$
begin
  if to_regclass('public.profiles') is not null then
    raise exception 'P10 aborted: public.profiles already exists.';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app_private'
      and p.proname in ('handle_new_user', 'set_updated_at')
  ) then
    raise exception 'P10 aborted: app_private helper functions already exist.';
  end if;

  if exists (
    select 1 from pg_trigger
    where tgname in ('on_auth_user_created', 'profiles_set_updated_at')
      and not tgisinternal
  ) then
    raise exception 'P10 aborted: a conflicting trigger name already exists.';
  end if;

  if to_regclass('public.programme_categories') is null
     or to_regclass('public.programmes') is null then
    raise exception 'P10 aborted: expected catalogue tables are missing.';
  end if;
end
$$;

-- 1. Internal, non-exposed schema -------------------------------------------
create schema if not exists app_private;

revoke all on schema app_private from public;
revoke all on schema app_private from anon;
revoke all on schema app_private from authenticated;
grant usage on schema app_private to postgres;

-- 2. Profile table -----------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text null,
  preferred_language text not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_preferred_language_check
    check (preferred_language in ('fr', 'en', 'de')),
  constraint profiles_display_name_length_check
    check (display_name is null or char_length(display_name) <= 100)
);

comment on table public.profiles is
  'Private application profile for an authenticated user. No email, no health data.';

-- 3. Privileges: revoke first, then grant the strict minimum -----------------
revoke all on table public.profiles from public;
revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

-- anon: no privileges at all.
grant select on table public.profiles to authenticated;
grant update (display_name, preferred_language) on table public.profiles to authenticated;

-- 4. Row Level Security ------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = id
  );

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = id
  )
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = id
  );

-- 5. updated_at maintained by the database ----------------------------------
create function app_private.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.created_at := old.created_at;
  new.id := old.id;
  return new;
end;
$$;

revoke all on function app_private.set_updated_at() from public;
revoke all on function app_private.set_updated_at() from anon;
revoke all on function app_private.set_updated_at() from authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function app_private.set_updated_at();

-- 6. Automatic profile creation on signup ------------------------------------
create function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function app_private.handle_new_user() from public;
revoke all on function app_private.handle_new_user() from anon;
revoke all on function app_private.handle_new_user() from authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function app_private.handle_new_user();

-- 7. Idempotent backfill of existing Auth users ------------------------------
insert into public.profiles (id)
select u.id
from auth.users u
on conflict (id) do nothing;

commit;
