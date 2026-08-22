-- P12 — Order Database Foundation (DRAFT — NOT APPLIED)
-- Target: bill-care-dev (DEV, ref ezwkeoapkmeftbbhdjua)
-- Scope: ORDER layer only. No payments, no entitlements, no seed data.
-- Browser roles are read-only; orders are authored later by a trusted
-- server-side commerce path that derives prices from the catalogue.

begin;

-- 0. Safety preconditions ---------------------------------------------------
do $$
begin
  if to_regclass('public.orders') is not null then
    raise exception 'P12 aborted: public.orders already exists.';
  end if;

  if to_regclass('public.order_items') is not null then
    raise exception 'P12 aborted: public.order_items already exists.';
  end if;

  if to_regclass('public.programmes') is null
     or to_regclass('public.programme_categories') is null then
    raise exception 'P12 aborted: expected catalogue tables are missing.';
  end if;

  if to_regclass('public.profiles') is null then
    raise exception 'P12 aborted: public.profiles is missing (P10 not applied).';
  end if;

  if not exists (select 1 from pg_namespace where nspname = 'app_private') then
    raise exception 'P12 aborted: app_private schema is missing (P10 not applied).';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app_private'
      and p.proname = 'set_order_updated_at'
  ) then
    raise exception 'P12 aborted: app_private.set_order_updated_at already exists.';
  end if;

  if exists (
    select 1 from pg_trigger
    where tgname = 'orders_set_updated_at'
      and not tgisinternal
  ) then
    raise exception 'P12 aborted: a conflicting trigger name already exists.';
  end if;
end
$$;

-- 1. public.orders -----------------------------------------------------------
create table public.orders (
  id            uuid        not null default gen_random_uuid(),
  user_id       uuid        not null,
  status        text        not null default 'pending',
  total_amount  integer     not null,
  currency      text        not null default 'EUR',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_user_id_fkey
    foreign key (user_id) references auth.users (id)
    on update cascade on delete restrict,
  constraint orders_status_check
    check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  constraint orders_total_amount_non_negative_check check (total_amount >= 0),
  constraint orders_currency_format_check check (currency ~ '^[A-Z]{3}$')
);

comment on table public.orders is
  'One-off purchase order header. Amounts are integer minor units (cents). '
  'Authoritative values are written only by a trusted server-side process.';

-- 2. public.order_items ------------------------------------------------------
create table public.order_items (
  id                uuid        not null default gen_random_uuid(),
  order_id          uuid        not null,
  programme_id      integer     not null,
  programme_title   jsonb       not null,
  unit_amount       integer     not null,
  currency          text        not null,
  quantity          integer     not null default 1,
  created_at        timestamptz not null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey
    foreign key (order_id) references public.orders (id)
    on update cascade on delete cascade,
  constraint order_items_programme_id_fkey
    foreign key (programme_id) references public.programmes (id)
    on update cascade on delete restrict,
  constraint order_items_unit_amount_non_negative_check check (unit_amount >= 0),
  constraint order_items_quantity_check check (quantity = 1),
  constraint order_items_currency_format_check check (currency ~ '^[A-Z]{3}$'),
  constraint order_items_programme_title_localized_check check (
    jsonb_typeof(programme_title) = 'object'
    and jsonb_typeof(programme_title -> 'fr') = 'string'
    and jsonb_typeof(programme_title -> 'en') = 'string'
    and jsonb_typeof(programme_title -> 'de') = 'string'
  ),
  constraint order_items_unique_programme_per_order unique (order_id, programme_id)
);

comment on table public.order_items is
  'Immutable purchase-time snapshot of a purchased programme. '
  'programme_title / unit_amount / currency are historical values and must never '
  'be re-derived from public.programmes.';

-- 3. Indexes -----------------------------------------------------------------
-- PK and UNIQUE(order_id, programme_id) already index (id) and (order_id, ...).
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
-- order_items(order_id) alone is served by the leading column of the unique
-- index order_items_unique_programme_per_order; no duplicate index created.

-- 4. Privileges: revoke first, then grant the strict minimum -----------------
revoke all on table public.orders from public;
revoke all on table public.orders from anon;
revoke all on table public.orders from authenticated;

revoke all on table public.order_items from public;
revoke all on table public.order_items from anon;
revoke all on table public.order_items from authenticated;

-- anon: no privileges at all.
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

-- 5. Row Level Security ------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
  );

create policy "order_items_select_own"
  on public.order_items
  for select
  to authenticated
  using (
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- 6. Database-controlled updated_at on orders --------------------------------
create function app_private.set_order_updated_at()
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

revoke all on function app_private.set_order_updated_at() from public;
revoke all on function app_private.set_order_updated_at() from anon;
revoke all on function app_private.set_order_updated_at() from authenticated;

create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function app_private.set_order_updated_at();

commit;
