alter table public.orders
  add column if not exists identity_detached_at timestamptz;

alter table public.orders
  alter column user_id drop not null;

alter table public.orders
  drop constraint if exists orders_user_id_fkey;

alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on update cascade
  on delete set null;

alter table public.privacy_request_events
  drop constraint if exists privacy_request_events_event_type_check;

alter table public.privacy_request_events
  add constraint privacy_request_events_event_type_check
  check (event_type in (
    'request_received',
    'processing_started',
    'export_generated',
    'request_completed',
    'status_changed',
    'identity_verified',
    'erasure_blocked',
    'erasure_database_completed',
    'auth_user_deleted',
    'erasure_completed'
  ));

create or replace function public.verify_privacy_erasure_request(p_request_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'app_private'
as $$
declare
  v_request public.privacy_requests%rowtype;
begin
  if p_request_id is null or p_user_id is null then
    raise exception 'privacy_erasure_invalid_request';
  end if;

  select * into v_request
  from public.privacy_requests r
  where r.id = p_request_id
    and r.requester_user_id = p_user_id
  for update;

  if not found then raise exception 'privacy_erasure_request_not_found'; end if;
  if v_request.request_type <> 'erasure' then raise exception 'privacy_erasure_wrong_request_type'; end if;
  if v_request.status not in ('requested', 'processing', 'partially_fulfilled') then
    raise exception 'privacy_erasure_request_not_actionable';
  end if;

  if v_request.identity_verified_at is null then
    update public.privacy_requests
    set identity_verified_at = now(),
        identity_verification_method = 'authenticated_session',
        implementation_version = 'p13-v1'
    where id = p_request_id;

    insert into public.privacy_request_events(request_id, event_type, actor_user_id, metadata)
    values (p_request_id, 'identity_verified', p_user_id, jsonb_build_object('method', 'authenticated_session'));
  end if;

  return true;
end;
$$;

create or replace function public.prepare_privacy_erasure(p_request_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'app_private'
as $$
declare
  v_request public.privacy_requests%rowtype;
  v_active_admin_count integer := 0;
  v_pending_order_count integer := 0;
  v_active_payment_count integer := 0;
  v_order_count integer := 0;
  v_blockers jsonb := '[]'::jsonb;
begin
  if p_request_id is null or p_user_id is null then raise exception 'privacy_erasure_invalid_request'; end if;

  select * into v_request
  from public.privacy_requests r
  where r.id = p_request_id
    and r.requester_user_id = p_user_id;

  if not found then raise exception 'privacy_erasure_request_not_found'; end if;
  if v_request.request_type <> 'erasure' then raise exception 'privacy_erasure_wrong_request_type'; end if;
  if v_request.status not in ('requested', 'processing', 'partially_fulfilled') then
    raise exception 'privacy_erasure_request_not_actionable';
  end if;

  select count(*) into v_active_admin_count
  from public.admin_memberships am
  where am.user_id = p_user_id and am.is_active = true;

  select count(*) into v_pending_order_count
  from public.orders o
  where o.user_id = p_user_id and o.status = 'pending';

  select count(*) into v_active_payment_count
  from public.payment_attempts pa
  join public.orders o on o.id = pa.order_id
  where o.user_id = p_user_id
    and pa.status in ('created', 'checkout_created', 'processing');

  select count(*) into v_order_count
  from public.orders o
  where o.user_id = p_user_id;

  if v_request.identity_verified_at is null then
    v_blockers := v_blockers || jsonb_build_array('identity_not_verified');
  end if;
  if v_active_admin_count > 0 then
    v_blockers := v_blockers || jsonb_build_array('active_admin_membership_manual_review_required');
  end if;
  if v_pending_order_count > 0 then
    v_blockers := v_blockers || jsonb_build_array('pending_order_manual_review_required');
  end if;
  if v_active_payment_count > 0 then
    v_blockers := v_blockers || jsonb_build_array('active_payment_manual_review_required');
  end if;

  return jsonb_build_object(
    'ready', jsonb_array_length(v_blockers) = 0,
    'blockers', v_blockers,
    'active_admin_memberships', v_active_admin_count,
    'pending_orders', v_pending_order_count,
    'active_payments', v_active_payment_count,
    'orders_to_detach', v_order_count,
    'commerce_retention_policy', 'pending_legal_tax_review'
  );
end;
$$;

create or replace function public.execute_privacy_erasure_database(p_request_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'app_private'
as $$
declare
  v_request public.privacy_requests%rowtype;
  v_prepare jsonb;
  v_session_progress integer := 0;
  v_exercise_completions integer := 0;
  v_enrollments integer := 0;
  v_entitlements integer := 0;
  v_profiles integer := 0;
  v_assignments integer := 0;
  v_memberships integer := 0;
  v_orders_detached integer := 0;
begin
  if p_request_id is null or p_user_id is null then raise exception 'privacy_erasure_invalid_request'; end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select * into v_request
  from public.privacy_requests r
  where r.id = p_request_id
    and r.requester_user_id = p_user_id
  for update;

  if not found then raise exception 'privacy_erasure_request_not_found'; end if;
  if v_request.request_type <> 'erasure' then raise exception 'privacy_erasure_wrong_request_type'; end if;
  if v_request.status not in ('requested', 'processing', 'partially_fulfilled') then
    raise exception 'privacy_erasure_request_not_actionable';
  end if;

  if v_request.status = 'partially_fulfilled'
     and v_request.outcome_category = 'database_erasure_completed_auth_deletion_pending' then
    return jsonb_build_object('database_erasure_completed', true, 'idempotent_retry', true, 'orders_detached', 0);
  end if;

  v_prepare := public.prepare_privacy_erasure(p_request_id, p_user_id);
  if coalesce((v_prepare->>'ready')::boolean, false) is not true then
    insert into public.privacy_request_events(request_id, event_type, actor_user_id, metadata)
    values (p_request_id, 'erasure_blocked', p_user_id, jsonb_build_object('blockers', v_prepare->'blockers'));
    raise exception 'privacy_erasure_blocked';
  end if;

  update public.privacy_requests
  set status = 'processing',
      processing_started_at = coalesce(processing_started_at, now()),
      implementation_version = 'p13-v1'
  where id = p_request_id;

  if not exists (
    select 1 from public.privacy_request_events e
    where e.request_id = p_request_id and e.event_type = 'processing_started'
  ) then
    insert into public.privacy_request_events(request_id, event_type, actor_user_id, metadata)
    values (p_request_id, 'processing_started', p_user_id, jsonb_build_object('mode', 'p13_erasure_orchestrator'));
  end if;

  select count(*) into v_session_progress
  from public.programme_session_progress psp
  join public.programme_enrollments pe on pe.id = psp.enrollment_id
  where pe.user_id = p_user_id;

  select count(*) into v_exercise_completions
  from public.programme_exercise_completions pec
  join public.programme_enrollments pe on pe.id = pec.enrollment_id
  where pe.user_id = p_user_id;

  select count(*) into v_enrollments from public.programme_enrollments pe where pe.user_id = p_user_id;
  select count(*) into v_entitlements from public.entitlements e where e.user_id = p_user_id;
  select count(*) into v_profiles from public.profiles p where p.id = p_user_id;
  select count(*) into v_assignments from public.admin_customer_assignments aca where aca.customer_user_id = p_user_id or aca.admin_user_id = p_user_id;
  select count(*) into v_memberships from public.admin_memberships am where am.user_id = p_user_id;

  delete from public.programme_session_progress psp
  using public.programme_enrollments pe
  where psp.enrollment_id = pe.id and pe.user_id = p_user_id;

  delete from public.programme_exercise_completions pec
  using public.programme_enrollments pe
  where pec.enrollment_id = pe.id and pe.user_id = p_user_id;

  delete from public.programme_enrollments where user_id = p_user_id;
  delete from public.entitlements where user_id = p_user_id;
  delete from public.admin_customer_assignments where customer_user_id = p_user_id or admin_user_id = p_user_id;
  delete from public.admin_memberships where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;

  update public.orders
  set user_id = null,
      identity_detached_at = coalesce(identity_detached_at, now()),
      updated_at = now()
  where user_id = p_user_id;
  get diagnostics v_orders_detached = row_count;

  update public.privacy_requests
  set status = 'partially_fulfilled',
      outcome_category = 'database_erasure_completed_auth_deletion_pending',
      retention_exception_reason = case
        when v_orders_detached > 0 then 'commerce_records_detached_and_retained_pending_legal_tax_retention_review'
        else null
      end,
      implementation_version = 'p13-v1'
  where id = p_request_id;

  insert into public.privacy_request_events(request_id, event_type, actor_user_id, metadata)
  values (
    p_request_id,
    'erasure_database_completed',
    p_user_id,
    jsonb_build_object(
      'programme_session_progress_deleted', v_session_progress,
      'exercise_completions_deleted', v_exercise_completions,
      'enrollments_deleted', v_enrollments,
      'entitlements_deleted', v_entitlements,
      'profiles_deleted', v_profiles,
      'admin_assignments_deleted', v_assignments,
      'admin_memberships_deleted', v_memberships,
      'orders_identity_detached', v_orders_detached,
      'commerce_retention_policy', 'pending_legal_tax_review'
    )
  );

  return jsonb_build_object(
    'database_erasure_completed', true,
    'idempotent_retry', false,
    'programme_session_progress_deleted', v_session_progress,
    'exercise_completions_deleted', v_exercise_completions,
    'enrollments_deleted', v_enrollments,
    'entitlements_deleted', v_entitlements,
    'profiles_deleted', v_profiles,
    'admin_assignments_deleted', v_assignments,
    'admin_memberships_deleted', v_memberships,
    'orders_detached', v_orders_detached
  );
end;
$$;

create or replace function public.finalize_privacy_erasure(p_request_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'app_private'
as $$
declare
  v_request public.privacy_requests%rowtype;
begin
  select * into v_request
  from public.privacy_requests r
  where r.id = p_request_id
  for update;

  if not found then raise exception 'privacy_erasure_request_not_found'; end if;
  if v_request.request_type <> 'erasure' then raise exception 'privacy_erasure_wrong_request_type'; end if;
  if v_request.requester_user_id is not null then raise exception 'privacy_erasure_auth_user_still_linked'; end if;

  if v_request.status = 'completed' and v_request.outcome_category = 'erasure_completed_commerce_detached' then
    return true;
  end if;

  if v_request.status <> 'partially_fulfilled'
     or v_request.outcome_category <> 'database_erasure_completed_auth_deletion_pending' then
    raise exception 'privacy_erasure_not_ready_to_finalize';
  end if;

  update public.privacy_requests
  set status = 'completed',
      completed_at = now(),
      outcome_category = 'erasure_completed_commerce_detached',
      implementation_version = 'p13-v1'
  where id = p_request_id;

  insert into public.privacy_request_events(request_id, event_type, actor_user_id, metadata)
  values
    (p_request_id, 'auth_user_deleted', null, '{}'::jsonb),
    (p_request_id, 'erasure_completed', null, jsonb_build_object('commerce_identity', 'detached'));

  return true;
end;
$$;

revoke execute on function public.verify_privacy_erasure_request(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.prepare_privacy_erasure(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.execute_privacy_erasure_database(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.finalize_privacy_erasure(uuid) from public, anon, authenticated;

grant execute on function public.verify_privacy_erasure_request(uuid, uuid) to service_role;
grant execute on function public.prepare_privacy_erasure(uuid, uuid) to service_role;
grant execute on function public.execute_privacy_erasure_database(uuid, uuid) to service_role;
grant execute on function public.finalize_privacy_erasure(uuid) to service_role;
