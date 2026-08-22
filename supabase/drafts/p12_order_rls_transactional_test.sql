-- P12 — RLS + privilege validation (TRANSACTIONAL, ALWAYS ROLLBACK).
-- Run in an administrative database session ONLY, after the migration is applied.
--
-- Properties of this script:
--   * Success produces ONLY validation notices; no result rows are required.
--   * The final ROLLBACK is MANDATORY: every synthetic auth user, order and
--     order item created here disappears when the transaction is rolled back.
--   * No real, pre-existing Auth user, order or order item is read, modified
--     or deleted. Only the two synthetic @example.invalid users are touched.
--   * Any assertion failure raises an exception, which aborts the transaction
--     and therefore also discards all synthetic data.

begin;

-- 1. Controlled synthetic auth users (rolled back; real accounts untouched).
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        created_at, updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid, '00000000-0000-0000-0000-000000000000'::uuid,
   'authenticated', 'authenticated', 'p12-test-a@example.invalid', '', now(), now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid, '00000000-0000-0000-0000-000000000000'::uuid,
   'authenticated', 'authenticated', 'p12-test-b@example.invalid', '', now(), now());

-- 2. Controlled orders, one per user. Uses an existing programme id.
with programme as (select id, title, price_amount, currency from public.programmes order by id limit 1)
insert into public.orders (id, user_id, status, total_amount, currency)
select 'a0000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
       'pending', p.price_amount, p.currency from programme p
union all
select 'b0000000-0000-4000-8000-000000000002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
       'pending', p.price_amount, p.currency from programme p;

insert into public.order_items (order_id, programme_id, programme_title, unit_amount, currency)
select o.id, p.id, p.title, p.price_amount, p.currency
from public.orders o
cross join (select id, title, price_amount, currency from public.programmes order by id limit 1) p
where o.id in ('a0000000-0000-4000-8000-000000000001',
               'b0000000-0000-4000-8000-000000000002');

-- 3. Simulate authenticated User A.
set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';

-- 4. READ assertions — self-validating, executed as role authenticated.
do $$
declare
  v_own_orders       bigint;
  v_other_orders     bigint;
  v_visible_items    bigint;
  v_other_items      bigint;
begin
  select count(*) into v_own_orders
  from public.orders
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  if v_own_orders <> 1 then
    raise exception 'P12 TEST FAILED: User A must see exactly 1 own order, saw %', v_own_orders;
  end if;

  select count(*) into v_other_orders
  from public.orders
  where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  if v_other_orders <> 0 then
    raise exception 'P12 TEST FAILED: User A must not see User B orders, saw %', v_other_orders;
  end if;

  select count(*) into v_visible_items from public.order_items;
  if v_visible_items <> 1 then
    raise exception 'P12 TEST FAILED: User A must see exactly 1 order_item, saw %', v_visible_items;
  end if;

  select count(*) into v_other_items
  from public.order_items
  where order_id = 'b0000000-0000-4000-8000-000000000002';
  if v_other_items <> 0 then
    raise exception 'P12 TEST FAILED: User A must not see User B order_items, saw %', v_other_items;
  end if;

  raise notice 'P12 READ assertions passed (own order visible, foreign rows hidden).';
end
$$;

-- 5. WRITE assertions — every forbidden operation is actually attempted.
--    Each attempt lives in its own subtransaction (BEGIN ... EXCEPTION block),
--    so the expected permission error rolls back only that statement and the
--    test continues. ONLY the insufficient_privilege condition is caught; any
--    other SQLSTATE propagates and fails the whole test.
do $$
declare
  v_op text;
begin
  -- 5.1 orders INSERT
  v_op := 'orders INSERT';
  begin
    insert into public.orders (user_id, total_amount, currency)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 0, 'EUR');
    raise exception 'P12 TEST FAILED: % unexpectedly succeeded', v_op;
  exception
    when insufficient_privilege then
      raise notice 'P12 OK: % correctly denied (insufficient_privilege).', v_op;
  end;

  -- 5.2 orders UPDATE (status -> paid)
  v_op := 'orders UPDATE status=paid';
  begin
    update public.orders
       set status = 'paid'
     where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    raise exception 'P12 TEST FAILED: % unexpectedly succeeded', v_op;
  exception
    when insufficient_privilege then
      raise notice 'P12 OK: % correctly denied (insufficient_privilege).', v_op;
  end;

  -- 5.3 orders DELETE
  v_op := 'orders DELETE';
  begin
    delete from public.orders
     where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    raise exception 'P12 TEST FAILED: % unexpectedly succeeded', v_op;
  exception
    when insufficient_privilege then
      raise notice 'P12 OK: % correctly denied (insufficient_privilege).', v_op;
  end;

  -- 5.4 order_items INSERT
  v_op := 'order_items INSERT';
  begin
    insert into public.order_items (order_id, programme_id, programme_title,
                                    unit_amount, currency)
    select 'a0000000-0000-4000-8000-000000000001', p.id,
           '{"fr":"x","en":"x","de":"x"}'::jsonb, 0, 'EUR'
    from public.programmes p order by p.id limit 1;
    raise exception 'P12 TEST FAILED: % unexpectedly succeeded', v_op;
  exception
    when insufficient_privilege then
      raise notice 'P12 OK: % correctly denied (insufficient_privilege).', v_op;
  end;

  -- 5.5 order_items UPDATE
  v_op := 'order_items UPDATE';
  begin
    update public.order_items set unit_amount = 0;
    raise exception 'P12 TEST FAILED: % unexpectedly succeeded', v_op;
  exception
    when insufficient_privilege then
      raise notice 'P12 OK: % correctly denied (insufficient_privilege).', v_op;
  end;

  -- 5.6 order_items DELETE
  v_op := 'order_items DELETE';
  begin
    delete from public.order_items;
    raise exception 'P12 TEST FAILED: % unexpectedly succeeded', v_op;
  exception
    when insufficient_privilege then
      raise notice 'P12 OK: % correctly denied (insufficient_privilege).', v_op;
  end;

  raise notice 'P12 WRITE assertions passed (all 6 browser writes denied).';
end
$$;

-- 6. Return to the administrative role and discard everything.
reset role;

-- MANDATORY: nothing created by this script may survive.
rollback;
