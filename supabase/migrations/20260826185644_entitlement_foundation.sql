create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  programme_id integer not null references public.programmes(id) on delete restrict,
  entitlement_type text not null default 'permanent_purchase' check (entitlement_type in ('permanent_purchase','subscription','manual')),
  status text not null default 'active' check (status in ('active','revoked','expired')),
  source_order_id uuid references public.orders(id) on delete restrict,
  source_order_item_id uuid unique references public.order_items(id) on delete restrict,
  granted_at timestamptz not null default now(),
  valid_until timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (entitlement_type <> 'permanent_purchase' or valid_until is null),
  check (status <> 'revoked' or revoked_at is not null)
);

comment on table public.entitlements is 'M10 authoritative programme access rights. A confirmed one-off purchase creates a permanent entitlement linked to the authenticated customer account. Browser payment-success pages never create access.';
comment on column public.entitlements.valid_until is 'NULL means no time expiry. One-off permanent purchases always use NULL.';

create index entitlements_user_status_idx on public.entitlements(user_id, status);
create index entitlements_programme_status_idx on public.entitlements(programme_id, status);
create unique index entitlements_one_active_permanent_purchase_idx
on public.entitlements(user_id, programme_id)
where entitlement_type = 'permanent_purchase' and status = 'active';

alter table public.entitlements enable row level security;
revoke all on public.entitlements from anon, authenticated;
grant select on public.entitlements to authenticated;

create policy entitlements_select_own
on public.entitlements
for select to authenticated
using (user_id = auth.uid());

create or replace function app_private.user_has_programme_entitlement(
  p_user_id uuid,
  p_programme_id integer
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.entitlements e
      where e.user_id = p_user_id
        and e.programme_id = p_programme_id
        and e.status = 'active'
        and (e.valid_until is null or e.valid_until > now())
    );
$$;
revoke all on function app_private.user_has_programme_entitlement(uuid, integer) from public, anon;
grant execute on function app_private.user_has_programme_entitlement(uuid, integer) to authenticated, service_role;

create or replace function app_private.user_has_exercise_entitlement(
  p_user_id uuid,
  p_exercise_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, app_private
as $$
  select p_user_id is not null
    and exists (
      select 1
      from public.programme_session_exercises pse
      join public.programme_sessions ps on ps.id = pse.session_id
      join public.programme_phases pp on pp.id = ps.phase_id
      where pse.exercise_id = p_exercise_id
        and pp.status = 'published'
        and ps.status = 'published'
        and app_private.user_has_programme_entitlement(p_user_id, pp.programme_id)
    );
$$;
revoke all on function app_private.user_has_exercise_entitlement(uuid, uuid) from public, anon;
grant execute on function app_private.user_has_exercise_entitlement(uuid, uuid) to authenticated, service_role;

create or replace function app_private.grant_paid_order_entitlements()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    insert into public.entitlements (
      user_id,
      programme_id,
      entitlement_type,
      status,
      source_order_id,
      source_order_item_id,
      granted_at,
      valid_until
    )
    select
      new.user_id,
      oi.programme_id,
      'permanent_purchase',
      'active',
      new.id,
      oi.id,
      now(),
      null
    from public.order_items oi
    where oi.order_id = new.id
    on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke all on function app_private.grant_paid_order_entitlements() from public, anon, authenticated;

create trigger orders_grant_paid_entitlements
  after insert or update of status on public.orders
  for each row
  execute function app_private.grant_paid_order_entitlements();

-- Replay-safe backfill for any legitimate paid orders that predate M10.
insert into public.entitlements (
  user_id,
  programme_id,
  entitlement_type,
  status,
  source_order_id,
  source_order_item_id,
  granted_at,
  valid_until
)
select
  o.user_id,
  oi.programme_id,
  'permanent_purchase',
  'active',
  o.id,
  oi.id,
  coalesce(o.updated_at, o.created_at, now()),
  null
from public.orders o
join public.order_items oi on oi.order_id = o.id
where o.status = 'paid'
on conflict do nothing;

-- Authenticated users may read only PUBLISHED programme content covered by an active entitlement.
grant select on public.programme_phases,
  public.programme_phase_translations,
  public.programme_sessions,
  public.programme_session_translations,
  public.programme_session_exercises,
  public.exercises,
  public.exercise_translations,
  public.exercise_variants,
  public.exercise_variant_translations
to authenticated;

create policy programme_phases_entitled_read
on public.programme_phases
for select to authenticated
using (
  status = 'published'
  and app_private.user_has_programme_entitlement(auth.uid(), programme_id)
);

create policy programme_phase_translations_entitled_read
on public.programme_phase_translations
for select to authenticated
using (
  exists (
    select 1
    from public.programme_phases pp
    where pp.id = programme_phase_translations.phase_id
      and pp.status = 'published'
      and app_private.user_has_programme_entitlement(auth.uid(), pp.programme_id)
  )
);

create policy programme_sessions_entitled_read
on public.programme_sessions
for select to authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.programme_phases pp
    where pp.id = programme_sessions.phase_id
      and pp.status = 'published'
      and app_private.user_has_programme_entitlement(auth.uid(), pp.programme_id)
  )
);

create policy programme_session_translations_entitled_read
on public.programme_session_translations
for select to authenticated
using (
  exists (
    select 1
    from public.programme_sessions ps
    join public.programme_phases pp on pp.id = ps.phase_id
    where ps.id = programme_session_translations.session_id
      and ps.status = 'published'
      and pp.status = 'published'
      and app_private.user_has_programme_entitlement(auth.uid(), pp.programme_id)
  )
);

create policy programme_session_exercises_entitled_read
on public.programme_session_exercises
for select to authenticated
using (
  exists (
    select 1
    from public.programme_sessions ps
    join public.programme_phases pp on pp.id = ps.phase_id
    join public.exercises e on e.id = programme_session_exercises.exercise_id
    where ps.id = programme_session_exercises.session_id
      and ps.status = 'published'
      and pp.status = 'published'
      and e.status = 'published'
      and app_private.user_has_programme_entitlement(auth.uid(), pp.programme_id)
  )
);

create policy exercises_entitled_read
on public.exercises
for select to authenticated
using (
  status = 'published'
  and app_private.user_has_exercise_entitlement(auth.uid(), id)
);

create policy exercise_translations_entitled_read
on public.exercise_translations
for select to authenticated
using (
  exists (
    select 1
    from public.exercises e
    where e.id = exercise_translations.exercise_id
      and e.status = 'published'
      and app_private.user_has_exercise_entitlement(auth.uid(), e.id)
  )
);

create policy exercise_variants_entitled_read
on public.exercise_variants
for select to authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.exercises e
    where e.id = exercise_variants.exercise_id
      and e.status = 'published'
      and app_private.user_has_exercise_entitlement(auth.uid(), e.id)
  )
);

create policy exercise_variant_translations_entitled_read
on public.exercise_variant_translations
for select to authenticated
using (
  exists (
    select 1
    from public.exercise_variants ev
    join public.exercises e on e.id = ev.exercise_id
    where ev.id = exercise_variant_translations.variant_id
      and ev.status = 'published'
      and e.status = 'published'
      and app_private.user_has_exercise_entitlement(auth.uid(), e.id)
  )
);
