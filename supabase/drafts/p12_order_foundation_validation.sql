-- P12 — Structural validation (READ-ONLY). Run after applying the migration.
-- Contains no DDL and no DML.

-- Tables exist
select to_regclass('public.orders')      as orders_table,
       to_regclass('public.order_items') as order_items_table;

-- Columns
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name in ('orders', 'order_items')
order by table_name, ordinal_position;

-- Constraints (PK / FK / CHECK / UNIQUE) and FK delete behaviour
select c.conrelid::regclass as table_name,
       c.conname,
       c.contype,
       c.confdeltype,
       pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid in ('public.orders'::regclass, 'public.order_items'::regclass)
order by 1, 2;

-- RLS enabled
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where oid in ('public.orders'::regclass, 'public.order_items'::regclass);

-- Policies: expect exactly one SELECT policy per table, roles = {authenticated}
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('orders', 'order_items')
order by tablename, policyname;

-- Privileges: expect anon => 0 rows, authenticated => SELECT only
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('orders', 'order_items')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- Indexes
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename in ('orders', 'order_items')
order by tablename, indexname;

-- Trigger + helper function scoping
select t.tgname, t.tgrelid::regclass as table_name, p.proname, p.prosecdef, p.proconfig
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
where not t.tgisinternal
  and t.tgrelid in ('public.orders'::regclass, 'public.order_items'::regclass);

-- Helper function must not be executable by browser roles (expect false)
select has_function_privilege('anon', 'app_private.set_order_updated_at()', 'execute')          as anon_execute,
       has_function_privilege('authenticated', 'app_private.set_order_updated_at()', 'execute') as authenticated_execute;

-- Data must be empty (this does NOT prove RLS)
select (select count(*) from public.orders)      as orders_rows,
       (select count(*) from public.order_items) as order_items_rows;
