-- P12 — Positive RLS validation (TRANSACTIONAL, ALWAYS ROLLBACK).
-- Run in an administrative database session ONLY, after the migration is applied.
-- Not executed during P12 authoring. Leaves no commerce rows behind.

begin;

-- 1. Controlled synthetic auth users (rolled back; real accounts untouched).
insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        created_at, updated_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'p12-test-a@example.invalid', '', now(), now()),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000',
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

-- Expect: 1 (own order visible)
select count(*) as a_sees_own_order from public.orders
where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

-- Expect: 0 (User B order hidden)
select count(*) as a_sees_b_order from public.orders
where user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

-- Expect: 1 own item, and total visible items = 1
select count(*) as a_visible_order_items from public.order_items;

-- Expect: 0
select count(*) as a_sees_b_order_items from public.order_items
where order_id = 'b0000000-0000-4000-8000-000000000002';

-- 4. Write attempts as the browser role. Each must fail with a permission error.
--    Run individually; a failure aborts the transaction block.
-- insert into public.orders (user_id, total_amount) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 0);
-- update public.orders set status = 'paid' where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
-- delete from public.orders where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
-- insert into public.order_items (order_id, programme_id, programme_title, unit_amount, currency)
--   values ('a0000000-0000-4000-8000-000000000001', 1, '{"fr":"x","en":"x","de":"x"}'::jsonb, 0, 'EUR');
-- update public.order_items set unit_amount = 0;
-- delete from public.order_items;

reset role;

rollback;
