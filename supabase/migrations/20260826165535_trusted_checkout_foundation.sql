alter table public.orders
  add column checkout_request_id uuid,
  add column safety_acknowledgement_version text references public.safety_acknowledgement_versions(version),
  add column safety_acknowledged_at timestamptz;

create unique index orders_user_checkout_request_unique
on public.orders (user_id, checkout_request_id)
where checkout_request_id is not null;

comment on column public.orders.checkout_request_id is 'Client-generated idempotency key. It prevents accidental duplicate pending orders; it never controls price or payment state.';
comment on column public.orders.safety_acknowledgement_version is 'Version of the safety warning explicitly acknowledged when trusted checkout was prepared. Detailed safety answers are not stored.';
comment on column public.orders.safety_acknowledged_at is 'Server timestamp recording when the active safety warning was acknowledged for this checkout.';

create or replace function app_private.evaluate_checkout_safety(
  p_body_regions text[],
  p_answers jsonb
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  q record;
  answer_value boolean;
  question_level text;
  result_level text := 'green';
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'invalid_safety_answers';
  end if;

  for q in
    select sq.stable_key, sq.risk_if_yes, sq.risk_if_no
    from public.safety_questions sq
    where sq.is_active = true
      and (
        sq.is_global = true
        or exists (
          select 1
          from public.safety_question_body_regions sqbr
          where sqbr.question_id = sq.id
            and sqbr.body_region_key = any(coalesce(p_body_regions, array[]::text[]))
        )
      )
    order by sq.sort_order, sq.stable_key
  loop
    if not (p_answers ? q.stable_key) then
      raise exception 'missing_safety_answer:%', q.stable_key;
    end if;

    if jsonb_typeof(p_answers -> q.stable_key) <> 'boolean' then
      raise exception 'invalid_safety_answer:%', q.stable_key;
    end if;

    answer_value := (p_answers ->> q.stable_key)::boolean;
    question_level := case when answer_value then q.risk_if_yes else q.risk_if_no end;

    if question_level = 'red' then
      return 'red';
    elsif question_level = 'amber' then
      result_level := 'amber';
    end if;
  end loop;

  return result_level;
end;
$$;

revoke all on function app_private.evaluate_checkout_safety(text[], jsonb) from public, anon, authenticated;

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
    and p.status = 'published';

  if v_found_count <> cardinality(p_programme_ids) then
    raise exception 'programme_not_available';
  end if;

  if (select count(distinct p.currency) from public.programmes p where p.id = any(p_programme_ids) and p.status='published') <> 1 then
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
  order by p.id;

  return query
  select v_order_id, v_total, v_currency, 'pending'::text;
end;
$$;

revoke all on function public.create_trusted_checkout_order(integer[], uuid, jsonb, text) from public, anon;
grant execute on function public.create_trusted_checkout_order(integer[], uuid, jsonb, text) to authenticated;

comment on function public.create_trusted_checkout_order(integer[], uuid, jsonb, text) is 'M08 trusted checkout preparation. Accepts programme IDs only, recomputes catalogue price/currency server-side, transiently re-evaluates M06 safety, requires the active safety acknowledgement, creates an idempotent pending order snapshot, and never marks payment or entitlement.';