-- P05 — Migration 001: Programme catalogue schema foundation (DEV: bill-care-dev)
-- Schema only. No seed data, no policies, no auth, no functions, no triggers.

-- 1. Categories -------------------------------------------------------------
create table public.programme_categories (
  key         text        not null,
  sort_order  integer     not null,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint programme_categories_pkey primary key (key),
  constraint programme_categories_sort_order_key unique (sort_order),
  constraint programme_categories_key_format_check
    check (key ~ '^[a-z][a-z0-9]*(-[a-z0-9]+)*$'),
  constraint programme_categories_sort_order_positive_check
    check (sort_order >= 0)
);

comment on table public.programme_categories is
  'Stable semantic programme categories (P02 keys). Display labels stay in the frontend i18n layer.';
comment on column public.programme_categories.key is
  'Stable semantic key, never translated text, never positional.';

-- 2. Programmes -------------------------------------------------------------
create table public.programmes (
  id            integer     not null,
  category_key  text        not null,
  region        jsonb       not null,
  title         jsonb       not null,
  price_amount  integer     not null,
  currency      text        not null default 'EUR',
  duration      text        not null,
  level         text        not null,
  image         text        not null,
  icd10         text        not null,
  status        text        not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint programmes_pkey primary key (id),
  constraint programmes_category_key_fkey
    foreign key (category_key) references public.programme_categories (key)
    on update cascade on delete restrict,
  constraint programmes_id_positive_check check (id > 0),
  constraint programmes_price_amount_non_negative_check check (price_amount >= 0),
  constraint programmes_currency_format_check check (currency ~ '^[A-Z]{3}$'),
  constraint programmes_status_check check (status in ('draft', 'published', 'archived')),
  constraint programmes_region_localized_check check (
    jsonb_typeof(region) = 'object'
    and region ? 'fr' and region ? 'en' and region ? 'de'
    and jsonb_typeof(region -> 'fr') = 'string'
    and jsonb_typeof(region -> 'en') = 'string'
    and jsonb_typeof(region -> 'de') = 'string'
  ),
  constraint programmes_title_localized_check check (
    jsonb_typeof(title) = 'object'
    and title ? 'fr' and title ? 'en' and title ? 'de'
    and jsonb_typeof(title -> 'fr') = 'string'
    and jsonb_typeof(title -> 'en') = 'string'
    and jsonb_typeof(title -> 'de') = 'string'
  )
);

comment on table public.programmes is
  'Programme catalogue. price_amount is stored in integer minor units (e.g. 49.90 EUR = 4990).';
comment on column public.programmes.price_amount is 'Integer minor units of currency. Never floating point.';
comment on column public.programmes.icd10 is 'Catalogue metadata only. Never linked to a user or a diagnosis.';

-- 3. Indexes (only those not already implied by PK/unique constraints) -------
create index programmes_category_key_idx on public.programmes (category_key);
create index programmes_status_idx on public.programmes (status);

-- 4. RLS — default deny (no application policies in P05) ---------------------
alter table public.programme_categories enable row level security;
alter table public.programmes enable row level security;
