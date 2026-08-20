-- P07 — Public Catalogue Read Access (DRAFT — not applied)
-- Target: bill-care-dev (DEV, ref ezwkeoapkmeftbbhdjua)
-- Purpose: Minimum secure read-only RLS configuration for the public catalogue.
-- Scope: read-only SELECT policies only. No writes, no schema changes, no data mutation.

begin;

-- 0. Safety precondition ----------------------------------------------------
-- Verify RLS is enabled on both catalogue tables and that no application
-- policies already exist. Abort if unexpected policies are found so that
-- existing access rules are never silently dropped or replaced.
do $$
declare
  v_categories_rls boolean;
  v_programmes_rls boolean;
  v_category_policies bigint;
  v_programme_policies bigint;
begin
  select c.relrowsecurity
    into v_categories_rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'programme_categories';

  select c.relrowsecurity
    into v_programmes_rls
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'programmes';

  if v_categories_rls is null then
    raise exception 'P07 aborted: public.programme_categories not found.';
  end if;

  if v_programmes_rls is null then
    raise exception 'P07 aborted: public.programmes not found.';
  end if;

  if not v_categories_rls then
    raise exception 'P07 aborted: RLS is not enabled on public.programme_categories.';
  end if;

  if not v_programmes_rls then
    raise exception 'P07 aborted: RLS is not enabled on public.programmes.';
  end if;

  select count(*)
    into v_category_policies
    from pg_policies
   where schemaname = 'public' and tablename = 'programme_categories';

  select count(*)
    into v_programme_policies
    from pg_policies
   where schemaname = 'public' and tablename = 'programmes';

  if v_category_policies > 0 then
    raise exception
      'P07 aborted: % existing policy/policies on public.programme_categories.',
      v_category_policies;
  end if;

  if v_programme_policies > 0 then
    raise exception
      'P07 aborted: % existing policy/policies on public.programmes.',
      v_programme_policies;
  end if;
end
$$;

-- 1. Table privileges -------------------------------------------------------
-- Strict read-only SELECT for the public-facing roles. ALL existing default
-- privileges (SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER)
-- are revoked first, then only SELECT is re-granted. service_role is
-- intentionally untouched here (admin bypass only).
revoke all privileges on public.programme_categories from anon, authenticated;
revoke all privileges on public.programmes from anon, authenticated;

grant select on public.programme_categories to anon, authenticated;
grant select on public.programmes to anon, authenticated;

-- 2. Category read policy ---------------------------------------------------
-- Public read access limited to active categories only.
create policy "public_read_active_categories"
  on public.programme_categories
  for select
  to anon, authenticated
  using (is_active = true);

-- 3. Programme read policy --------------------------------------------------
-- Public read access limited to published programmes only.
create policy "public_read_published_programmes"
  on public.programmes
  for select
  to anon, authenticated
  using (status = 'published');

commit;
