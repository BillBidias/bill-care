alter table public.programmes
  add column checkout_enabled boolean not null default false;

comment on column public.programmes.checkout_enabled is
  'Explicit commerce release gate. False by default. A programme may be visible in the catalogue while checkout remains disabled until clinical, legal and operational release requirements are satisfied.';

create or replace function public.create_trusted_checkout_order(
  p_programme_ids integer[],
  p_checkout_request_id uuid,
  p_safety_answers jsonb,
  p_acknowledgement_version text
)
returns table (
  order_id uuid,
  total_amount integer,
  currency text,
  order_status text
)
language plpgsql
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  v_user_id uuid := auth.uid();
  v_distinct_count integer;
  v_found_count integer;
  v_total integer;
  v_currency text;
  v_regions text[];
  v_safety_level text;
  v_order_id uuid;
  v_existing public.orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;

  if p_checkout_request_id is null then
    raise exception 'checkout_request_id_required';
  end if;

  if p_programme_ids is null or cardinality(p_programme_ids) < 1 or cardinality(p_programme_ids) > 10 then
    raise exception 'invalid_checkout_item_count';
  end if;

  if exists (select 1 from unnest(p_programme_ids) as x(id) where id is null or id <= 0) then
    raise exception 'invalid_programme_id';
  end if;

  select count(distinct x.id) into v_distinct_count
  from unnest(p_programme_ids) as x(id);

  if v_distinct_count <> cardinality(p_programme_ids) then
    raise exception 'duplicate_programme_ids_not_allowed';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_checkout_request_id::text, 0));

  select * into v_existing
  from public.orders o
  where o.user_id = v_user_id
    and o.checkout_request_id = p_checkout_request_id
  limit 1;

  if found then
    return query
    select v_existing.id, v_existing.total_amount, v_existing.currency, v_existing.status;
    return;
  end if;

  select count(*), sum(p.price_amount)::integer, min(p.currency)
    into v_found_count, v_total, v_currency
  from public.programmes p
  where p.id = any(p_programme_ids)
    and p.status = 'published'
    and p.checkout_enabled = true
    and exists (
      select 1
      from public.programme_phases pp
      join public.programme_sessions ps on ps.phase_id = pp.id
      join public.programme_session_exercises pse on pse.session_id = ps.id
      join public.exercises e on e.id = pse.exercise_id
      where pp.programme_id = p.id
        and pp.status = 'published'
        and ps.status = 'published'
        and e.status = 'published'
    );

  if v_found_count <> cardinality(p_programme_ids) then
    raise exception 'programme_not_available_for_checkout';
  end if;

  if (
    select count(distinct p.currency)
    from public.programmes p
    where p.id = any(p_programme_ids)
      and p.status = 'published'
      and p.checkout_enabled = true
  ) <> 1 then
    raise exception 'mixed_checkout_currencies_not_supported';
  end if;

  select coalesce(array_agg(distinct pbr.body_region_key), array[]::text[])
    into v_regions
  from public.programme_body_regions pbr
  where pbr.programme_id = any(p_programme_ids);

  v_safety_level := app_private.evaluate_checkout_safety(v_regions, p_safety_answers);

  if v_safety_level = 'red' then
    raise exception 'checkout_blocked_red_safety';
  elsif v_safety_level = 'amber' then
    raise exception 'checkout_requires_professional_review';
  end if;

  if p_acknowledgement_version is null or not exists (
    select 1
    from public.safety_acknowledgement_versions sav
    where sav.version = p_acknowledgement_version
      and sav.is_active = true
  ) then
    raise exception 'active_safety_acknowledgement_required';
  end if;

  insert into public.orders (
    user_id,
    status,
    total_amount,
    currency,
    checkout_request_id,
    safety_acknowledgement_version,
    safety_acknowledged_at
  ) values (
    v_user_id,
    'pending',
    v_total,
    v_currency,
    p_checkout_request_id,
    p_acknowledgement_version,
    now()
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    programme_id,
    programme_title,
    unit_amount,
    currency,
    quantity
  )
  select
    v_order_id,
    p.id,
    p.title,
    p.price_amount,
    p.currency,
    1
  from public.programmes p
  where p.id = any(p_programme_ids)
    and p.status = 'published'
    and p.checkout_enabled = true
  order by p.id;

  return query
  select v_order_id, v_total, v_currency, 'pending'::text;
end;
$$;

revoke all on function public.create_trusted_checkout_order(integer[], uuid, jsonb, text) from public, anon;
grant execute on function public.create_trusted_checkout_order(integer[], uuid, jsonb, text) to authenticated;

comment on function public.create_trusted_checkout_order(integer[], uuid, jsonb, text) is
  'M08 trusted checkout preparation with commerce release gate. Requires authenticated user, server-authoritative prices, active checkout_enabled programme, technically published programme content, transient M06 safety re-evaluation and active safety acknowledgement. Creates only a pending order; payment and entitlement remain separate.';