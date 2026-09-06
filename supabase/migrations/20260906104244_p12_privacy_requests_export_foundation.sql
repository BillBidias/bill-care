create table public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid default auth.uid() references auth.users(id) on delete set null,
  request_type text not null check (request_type in ('access', 'export', 'rectification', 'erasure', 'restriction', 'objection')),
  status text not null default 'requested' check (status in ('requested', 'processing', 'completed', 'partially_fulfilled', 'rejected', 'cancelled')),
  requested_at timestamptz not null default now(),
  identity_verified_at timestamptz,
  identity_verification_method text,
  processing_started_at timestamptz,
  completed_at timestamptz,
  response_due_at timestamptz,
  outcome_category text,
  retention_exception_reason text,
  implementation_version text not null default 'p12-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint privacy_requests_requester_required_on_create check (requester_user_id is not null or status <> 'requested')
);

create unique index privacy_requests_one_open_per_type_idx
  on public.privacy_requests(requester_user_id, request_type)
  where requester_user_id is not null and status in ('requested', 'processing');

create index privacy_requests_user_requested_at_idx
  on public.privacy_requests(requester_user_id, requested_at desc);

create table public.privacy_request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.privacy_requests(id) on delete cascade,
  event_type text not null check (event_type in (
    'request_received',
    'processing_started',
    'export_generated',
    'request_completed',
    'status_changed'
  )),
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index privacy_request_events_request_created_at_idx
  on public.privacy_request_events(request_id, created_at asc);

alter table public.privacy_requests enable row level security;
alter table public.privacy_request_events enable row level security;

create policy privacy_requests_select_own
  on public.privacy_requests
  for select
  to authenticated
  using (requester_user_id = (select auth.uid()));

create policy privacy_requests_insert_own
  on public.privacy_requests
  for insert
  to authenticated
  with check (
    requester_user_id = (select auth.uid())
    and status = 'requested'
    and identity_verified_at is null
    and identity_verification_method is null
    and processing_started_at is null
    and completed_at is null
    and response_due_at is null
    and outcome_category is null
    and retention_exception_reason is null
    and implementation_version = 'p12-v1'
  );

create policy privacy_request_events_select_own
  on public.privacy_request_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.privacy_requests r
      where r.id = privacy_request_events.request_id
        and r.requester_user_id = (select auth.uid())
    )
  );

revoke all on table public.privacy_requests from anon, authenticated;
revoke all on table public.privacy_request_events from anon, authenticated;
grant select on table public.privacy_requests to authenticated;
grant insert (request_type) on table public.privacy_requests to authenticated;
grant select on table public.privacy_request_events to authenticated;

grant select, insert, update, delete on table public.privacy_requests to service_role;
grant select, insert, update, delete on table public.privacy_request_events to service_role;
grant usage, select on sequence public.privacy_request_events_id_seq to service_role;

create trigger privacy_requests_set_updated_at
before update on public.privacy_requests
for each row execute function app_private.set_updated_at();

create or replace function app_private.log_privacy_request_received()
returns trigger
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'app_private'
as $$
begin
  insert into public.privacy_request_events (
    request_id,
    event_type,
    actor_user_id,
    metadata
  ) values (
    new.id,
    'request_received',
    new.requester_user_id,
    jsonb_build_object('request_type', new.request_type, 'implementation_version', new.implementation_version)
  );
  return new;
end;
$$;

revoke execute on function app_private.log_privacy_request_received() from public, anon, authenticated;
grant execute on function app_private.log_privacy_request_received() to service_role;

create trigger privacy_requests_log_received
after insert on public.privacy_requests
for each row execute function app_private.log_privacy_request_received();

create or replace function public.generate_my_privacy_export(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'app_private'
as $$
declare
  v_user_id uuid := auth.uid();
  v_request public.privacy_requests%rowtype;
  v_payload jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;

  select * into v_request
  from public.privacy_requests r
  where r.id = p_request_id
    and r.requester_user_id = v_user_id
  for update;

  if not found then
    raise exception 'privacy_request_not_found';
  end if;

  if v_request.request_type not in ('access', 'export') then
    raise exception 'privacy_request_not_exportable';
  end if;

  if v_request.status in ('rejected', 'cancelled') then
    raise exception 'privacy_request_not_exportable';
  end if;

  update public.privacy_requests
  set status = 'processing',
      processing_started_at = coalesce(processing_started_at, now())
  where id = p_request_id;

  insert into public.privacy_request_events (request_id, event_type, actor_user_id, metadata)
  values (p_request_id, 'processing_started', v_user_id, jsonb_build_object('mode', 'automated_safe_export'));

  update public.privacy_requests
  set status = 'completed',
      completed_at = now(),
      outcome_category = 'automated_safe_export_generated'
  where id = p_request_id;

  insert into public.privacy_request_events (request_id, event_type, actor_user_id, metadata)
  values
    (p_request_id, 'export_generated', v_user_id, jsonb_build_object('format', 'json', 'schema_version', 'p12-v1')),
    (p_request_id, 'request_completed', v_user_id, jsonb_build_object('outcome', 'automated_safe_export_generated'));

  select jsonb_build_object(
    'account', (
      select jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'created_at', u.created_at,
        'last_sign_in_at', u.last_sign_in_at
      )
      from auth.users u
      where u.id = v_user_id
    ),
    'profile', (
      select coalesce(to_jsonb(p), 'null'::jsonb)
      from public.profiles p
      where p.id = v_user_id
    ),
    'orders', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'status', o.status,
          'total_amount', o.total_amount,
          'currency', o.currency,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'safety_acknowledgement_version', o.safety_acknowledgement_version,
          'safety_acknowledged_at', o.safety_acknowledged_at,
          'items', (
            select coalesce(jsonb_agg(
              jsonb_build_object(
                'id', oi.id,
                'programme_id', oi.programme_id,
                'programme_title', oi.programme_title,
                'unit_amount', oi.unit_amount,
                'currency', oi.currency,
                'quantity', oi.quantity,
                'created_at', oi.created_at
              ) order by oi.created_at, oi.id
            ), '[]'::jsonb)
            from public.order_items oi
            where oi.order_id = o.id
          )
        ) order by o.created_at, o.id
      ), '[]'::jsonb)
      from public.orders o
      where o.user_id = v_user_id
    ),
    'payments', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', pa.id,
          'order_id', pa.order_id,
          'provider', pa.provider,
          'status', pa.status,
          'amount', pa.amount,
          'currency', pa.currency,
          'created_at', pa.created_at,
          'updated_at', pa.updated_at,
          'succeeded_at', pa.succeeded_at,
          'failed_at', pa.failed_at,
          'cancelled_at', pa.cancelled_at
        ) order by pa.created_at, pa.id
      ), '[]'::jsonb)
      from public.payment_attempts pa
      join public.orders o on o.id = pa.order_id
      where o.user_id = v_user_id
    ),
    'entitlements', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'programme_id', e.programme_id,
          'entitlement_type', e.entitlement_type,
          'status', e.status,
          'source_order_id', e.source_order_id,
          'granted_at', e.granted_at,
          'valid_until', e.valid_until,
          'revoked_at', e.revoked_at,
          'created_at', e.created_at,
          'updated_at', e.updated_at
        ) order by e.created_at, e.id
      ), '[]'::jsonb)
      from public.entitlements e
      where e.user_id = v_user_id
    ),
    'programme_enrollments', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', pe.id,
          'programme_id', pe.programme_id,
          'entitlement_id', pe.entitlement_id,
          'cycle_number', pe.cycle_number,
          'status', pe.status,
          'current_phase_id', pe.current_phase_id,
          'current_session_id', pe.current_session_id,
          'enrolled_at', pe.enrolled_at,
          'started_at', pe.started_at,
          'paused_at', pe.paused_at,
          'completed_at', pe.completed_at,
          'cancelled_at', pe.cancelled_at,
          'last_activity_at', pe.last_activity_at,
          'created_at', pe.created_at,
          'updated_at', pe.updated_at
        ) order by pe.created_at, pe.id
      ), '[]'::jsonb)
      from public.programme_enrollments pe
      where pe.user_id = v_user_id
    ),
    'session_progress', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', psp.id,
          'enrollment_id', psp.enrollment_id,
          'session_id', psp.session_id,
          'status', psp.status,
          'started_at', psp.started_at,
          'completed_at', psp.completed_at,
          'updated_at', psp.updated_at
        ) order by psp.updated_at, psp.id
      ), '[]'::jsonb)
      from public.programme_session_progress psp
      join public.programme_enrollments pe on pe.id = psp.enrollment_id
      where pe.user_id = v_user_id
    ),
    'exercise_completions', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', pec.id,
          'enrollment_id', pec.enrollment_id,
          'prescription_id', pec.prescription_id,
          'completed_at', pec.completed_at,
          'created_at', pec.created_at
        ) order by pec.created_at, pec.id
      ), '[]'::jsonb)
      from public.programme_exercise_completions pec
      join public.programme_enrollments pe on pe.id = pec.enrollment_id
      where pe.user_id = v_user_id
    ),
    'privacy_requests', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'request_type', r.request_type,
          'status', r.status,
          'requested_at', r.requested_at,
          'processing_started_at', r.processing_started_at,
          'completed_at', r.completed_at,
          'outcome_category', r.outcome_category,
          'implementation_version', r.implementation_version
        ) order by r.requested_at, r.id
      ), '[]'::jsonb)
      from public.privacy_requests r
      where r.requester_user_id = v_user_id
    ),
    'privacy_request_events', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'request_id', e.request_id,
          'event_type', e.event_type,
          'created_at', e.created_at
        ) order by e.created_at, e.id
      ), '[]'::jsonb)
      from public.privacy_request_events e
      join public.privacy_requests r on r.id = e.request_id
      where r.requester_user_id = v_user_id
    )
  ) into v_payload;

  return jsonb_build_object(
    'schema_version', 'p12-v1',
    'request_id', p_request_id,
    'generated_at', now(),
    'scope', jsonb_build_object(
      'kind', 'automated_safe_export',
      'not_a_final_legal_access_assessment', true,
      'manual_review_exclusions', jsonb_build_array(
        'admin/security audit metadata that may contain third-party or internal security information',
        'raw payment-provider event payloads or secret material',
        'data held by processors outside this application database that require provider/legal review'
      )
    ),
    'data', v_payload
  );
end;
$$;

revoke execute on function public.generate_my_privacy_export(uuid) from public, anon;
grant execute on function public.generate_my_privacy_export(uuid) to authenticated, service_role;
