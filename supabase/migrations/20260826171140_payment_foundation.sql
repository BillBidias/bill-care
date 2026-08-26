create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_request_id uuid not null,
  provider text not null default 'stripe' check (provider = 'stripe'),
  status text not null default 'created' check (status in ('created','checkout_created','processing','succeeded','failed','cancelled')),
  provider_checkout_session_id text unique,
  provider_payment_intent_id text unique,
  amount integer not null check (amount >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  succeeded_at timestamptz,
  failed_at timestamptz,
  cancelled_at timestamptz,
  unique (order_id, payment_request_id)
);

comment on table public.payment_attempts is 'M09 server-authoritative payment attempts. Browser users may read their own attempts but cannot create or modify them. Stripe identifiers are server-managed.';

create unique index payment_attempts_one_open_per_order_idx
on public.payment_attempts(order_id)
where status in ('created','checkout_created','processing');

create index payment_attempts_order_id_idx on public.payment_attempts(order_id);

create table public.payment_events (
  provider_event_id text primary key,
  provider text not null default 'stripe' check (provider = 'stripe'),
  event_type text not null,
  payment_attempt_id uuid references public.payment_attempts(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  processing_status text not null check (processing_status in ('accepted','ignored','rejected')),
  received_at timestamptz not null default now(),
  processed_at timestamptz not null default now()
);

comment on table public.payment_events is 'M09 minimal idempotency/audit registry for verified Stripe webhook events. Raw Stripe payloads are deliberately not stored.';

alter table public.payment_attempts enable row level security;
alter table public.payment_events enable row level security;

revoke all on public.payment_attempts, public.payment_events from anon, authenticated;
grant select on public.payment_attempts to authenticated;

create policy payment_attempts_select_own
on public.payment_attempts
for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = payment_attempts.order_id
      and o.user_id = auth.uid()
  )
);

create or replace function public.prepare_stripe_payment_attempt(
  p_order_id uuid,
  p_user_id uuid,
  p_payment_request_id uuid
)
returns table (
  attempt_id uuid,
  order_total integer,
  order_currency text,
  existing_checkout_session_id text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_order public.orders%rowtype;
  v_attempt public.payment_attempts%rowtype;
begin
  if p_order_id is null or p_user_id is null or p_payment_request_id is null then
    raise exception 'invalid_payment_attempt_request';
  end if;

  select * into v_order
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found or v_order.user_id <> p_user_id then
    raise exception 'order_not_found';
  end if;

  if v_order.status = 'paid' then
    raise exception 'order_already_paid';
  end if;

  if v_order.status <> 'pending' then
    raise exception 'order_not_payable';
  end if;

  if v_order.safety_acknowledgement_version is null or v_order.safety_acknowledged_at is null then
    raise exception 'trusted_checkout_not_completed';
  end if;

  select * into v_attempt
  from public.payment_attempts pa
  where pa.order_id = p_order_id
    and pa.status in ('created','checkout_created','processing')
  order by pa.created_at desc
  limit 1;

  if found then
    return query
    select v_attempt.id, v_attempt.amount, v_attempt.currency, v_attempt.provider_checkout_session_id;
    return;
  end if;

  insert into public.payment_attempts (
    order_id, payment_request_id, provider, status, amount, currency
  ) values (
    v_order.id, p_payment_request_id, 'stripe', 'created', v_order.total_amount, v_order.currency
  )
  returning * into v_attempt;

  return query
  select v_attempt.id, v_attempt.amount, v_attempt.currency, v_attempt.provider_checkout_session_id;
end;
$$;

revoke all on function public.prepare_stripe_payment_attempt(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.prepare_stripe_payment_attempt(uuid, uuid, uuid) to service_role;

create or replace function public.attach_stripe_checkout_session(
  p_attempt_id uuid,
  p_session_id text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_attempt_id is null or p_session_id is null or length(btrim(p_session_id)) = 0 then
    raise exception 'invalid_checkout_session';
  end if;

  update public.payment_attempts
  set provider_checkout_session_id = p_session_id,
      status = 'checkout_created',
      updated_at = now()
  where id = p_attempt_id
    and status in ('created','checkout_created');

  if not found then
    raise exception 'payment_attempt_not_attachable';
  end if;
end;
$$;

revoke all on function public.attach_stripe_checkout_session(uuid, text) from public, anon, authenticated;
grant execute on function public.attach_stripe_checkout_session(uuid, text) to service_role;

create or replace function public.process_stripe_checkout_event(
  p_event_id text,
  p_event_type text,
  p_session_id text,
  p_payment_intent_id text,
  p_payment_status text,
  p_amount_total integer,
  p_currency text
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_attempt public.payment_attempts%rowtype;
  v_order public.orders%rowtype;
  v_result text;
begin
  if p_event_id is null or p_event_type is null or p_session_id is null then
    raise exception 'invalid_stripe_event';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_event_id, 0));

  select processing_status into v_result
  from public.payment_events
  where provider_event_id = p_event_id;

  if found then
    return 'duplicate:' || v_result;
  end if;

  select * into v_attempt
  from public.payment_attempts pa
  where pa.provider_checkout_session_id = p_session_id
  for update;

  if not found then
    insert into public.payment_events (
      provider_event_id, provider, event_type, processing_status
    ) values (
      p_event_id, 'stripe', p_event_type, 'ignored'
    );
    return 'ignored:no_matching_attempt';
  end if;

  select * into v_order
  from public.orders o
  where o.id = v_attempt.order_id
  for update;

  if not found then
    insert into public.payment_events (
      provider_event_id, provider, event_type, payment_attempt_id, processing_status
    ) values (
      p_event_id, 'stripe', p_event_type, v_attempt.id, 'rejected'
    );
    return 'rejected:missing_order';
  end if;

  if p_amount_total is null
     or p_currency is null
     or p_amount_total <> v_attempt.amount
     or upper(p_currency) <> v_attempt.currency
     or p_amount_total <> v_order.total_amount
     or upper(p_currency) <> v_order.currency then
    update public.payment_attempts
    set status = case when status = 'succeeded' then status else 'failed' end,
        failed_at = case when status = 'succeeded' then failed_at else now() end,
        updated_at = now()
    where id = v_attempt.id;

    insert into public.payment_events (
      provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
    ) values (
      p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'rejected'
    );
    return 'rejected:amount_or_currency_mismatch';
  end if;

  if p_event_type in ('checkout.session.completed','checkout.session.async_payment_succeeded') then
    if lower(coalesce(p_payment_status,'')) = 'paid' then
      if v_order.status not in ('pending','paid') then
        insert into public.payment_events (
          provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
        ) values (
          p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'rejected'
        );
        return 'rejected:order_state';
      end if;

      update public.payment_attempts
      set status = 'succeeded',
          provider_payment_intent_id = coalesce(nullif(p_payment_intent_id,''), provider_payment_intent_id),
          succeeded_at = coalesce(succeeded_at, now()),
          updated_at = now()
      where id = v_attempt.id;

      update public.orders
      set status = 'paid',
          updated_at = now()
      where id = v_order.id
        and status = 'pending';

      insert into public.payment_events (
        provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
      ) values (
        p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'accepted'
      );
      return 'accepted:paid';
    end if;

    if p_event_type = 'checkout.session.completed' then
      update public.payment_attempts
      set status = 'processing',
          provider_payment_intent_id = coalesce(nullif(p_payment_intent_id,''), provider_payment_intent_id),
          updated_at = now()
      where id = v_attempt.id
        and status <> 'succeeded';

      insert into public.payment_events (
        provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
      ) values (
        p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'accepted'
      );
      return 'accepted:processing';
    end if;

    insert into public.payment_events (
      provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
    ) values (
      p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'rejected'
    );
    return 'rejected:async_success_without_paid_status';
  elsif p_event_type = 'checkout.session.async_payment_failed' then
    update public.payment_attempts
    set status = case when status = 'succeeded' then status else 'failed' end,
        failed_at = case when status = 'succeeded' then failed_at else now() end,
        provider_payment_intent_id = coalesce(nullif(p_payment_intent_id,''), provider_payment_intent_id),
        updated_at = now()
    where id = v_attempt.id;

    insert into public.payment_events (
      provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
    ) values (
      p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'accepted'
    );
    return 'accepted:failed';
  elsif p_event_type = 'checkout.session.expired' then
    update public.payment_attempts
    set status = case when status = 'succeeded' then status else 'cancelled' end,
        cancelled_at = case when status = 'succeeded' then cancelled_at else now() end,
        updated_at = now()
    where id = v_attempt.id;

    insert into public.payment_events (
      provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
    ) values (
      p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'accepted'
    );
    return 'accepted:cancelled';
  else
    insert into public.payment_events (
      provider_event_id, provider, event_type, payment_attempt_id, order_id, processing_status
    ) values (
      p_event_id, 'stripe', p_event_type, v_attempt.id, v_order.id, 'ignored'
    );
    return 'ignored:event_type';
  end if;
end;
$$;

revoke all on function public.process_stripe_checkout_event(text, text, text, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.process_stripe_checkout_event(text, text, text, text, text, integer, text) to service_role;
