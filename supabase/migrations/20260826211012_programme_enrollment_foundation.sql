alter table public.entitlements
  add constraint entitlements_id_user_programme_unique unique (id, user_id, programme_id);

create table public.programme_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  programme_id integer not null references public.programmes(id) on delete restrict,
  entitlement_id uuid not null,
  cycle_number integer not null check (cycle_number > 0),
  status text not null default 'active' check (status in ('active','paused','completed','cancelled')),
  current_phase_id uuid references public.programme_phases(id) on delete restrict,
  current_session_id uuid references public.programme_sessions(id) on delete restrict,
  enrolled_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programme_enrollments_entitlement_matches
    foreign key (entitlement_id, user_id, programme_id)
    references public.entitlements(id, user_id, programme_id)
    on delete restrict,
  unique (user_id, programme_id, cycle_number),
  check (status <> 'paused' or paused_at is not null),
  check (status <> 'completed' or completed_at is not null),
  check (status <> 'cancelled' or cancelled_at is not null)
);

comment on table public.programme_enrollments is 'M11 patient programme participation. Entitlement grants access; enrollment records that the patient has actually started a programme. Multiple cycles are allowed over time, but only one active/paused cycle may exist per user and programme.';
comment on column public.programme_enrollments.cycle_number is 'Sequential participation cycle for repeat use of a permanently owned programme.';
comment on column public.programme_enrollments.current_phase_id is 'Current published phase pointer. It does not grant access by itself; M10 entitlement remains authoritative.';
comment on column public.programme_enrollments.current_session_id is 'Current published session pointer. Progression rules are handled by later programme/progress modules.';

create unique index programme_enrollments_one_open_cycle_idx
on public.programme_enrollments(user_id, programme_id)
where status in ('active','paused');

create index programme_enrollments_user_status_idx
on public.programme_enrollments(user_id, status);
create index programme_enrollments_programme_status_idx
on public.programme_enrollments(programme_id, status);

create trigger programme_enrollments_touch_updated_at
before update on public.programme_enrollments
for each row execute function app_private.touch_content_updated_at();

create or replace function app_private.validate_programme_enrollment_position()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_session_phase uuid;
begin
  if new.current_phase_id is not null and not exists (
    select 1 from public.programme_phases pp
    where pp.id = new.current_phase_id
      and pp.programme_id = new.programme_id
  ) then
    raise exception 'enrollment_phase_programme_mismatch';
  end if;

  if new.current_session_id is not null then
    select ps.phase_id into v_session_phase
    from public.programme_sessions ps
    join public.programme_phases pp on pp.id = ps.phase_id
    where ps.id = new.current_session_id
      and pp.programme_id = new.programme_id;

    if v_session_phase is null then
      raise exception 'enrollment_session_programme_mismatch';
    end if;

    if new.current_phase_id is not null and v_session_phase <> new.current_phase_id then
      raise exception 'enrollment_session_phase_mismatch';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function app_private.validate_programme_enrollment_position() from public, anon, authenticated;

create trigger programme_enrollments_validate_position
before insert or update of programme_id, current_phase_id, current_session_id
on public.programme_enrollments
for each row execute function app_private.validate_programme_enrollment_position();

alter table public.programme_enrollments enable row level security;
revoke all on public.programme_enrollments from anon, authenticated;
grant select on public.programme_enrollments to authenticated;

create policy programme_enrollments_select_own
on public.programme_enrollments
for select to authenticated
using (user_id = auth.uid());

create or replace function public.start_programme_enrollment(p_programme_id integer)
returns table (
  enrollment_id uuid,
  programme_id integer,
  entitlement_id uuid,
  cycle_number integer,
  enrollment_status text,
  current_phase_id uuid,
  current_session_id uuid,
  started_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  v_user_id uuid := auth.uid();
  v_entitlement public.entitlements%rowtype;
  v_existing public.programme_enrollments%rowtype;
  v_phase_id uuid;
  v_session_id uuid;
  v_cycle integer;
  v_enrollment public.programme_enrollments%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;
  if p_programme_id is null or p_programme_id <= 0 then
    raise exception 'invalid_programme_id';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':programme:' || p_programme_id::text, 0));

  select pe.* into v_existing
  from public.programme_enrollments pe
  where pe.user_id = v_user_id
    and pe.programme_id = p_programme_id
    and pe.status in ('active','paused')
  order by pe.cycle_number desc
  limit 1;

  if found then
    return query select
      v_existing.id,
      v_existing.programme_id,
      v_existing.entitlement_id,
      v_existing.cycle_number,
      v_existing.status,
      v_existing.current_phase_id,
      v_existing.current_session_id,
      v_existing.started_at;
    return;
  end if;

  if not exists (
    select 1 from public.programmes p
    where p.id = p_programme_id and p.status = 'published'
  ) then
    raise exception 'programme_not_available';
  end if;

  select e.* into v_entitlement
  from public.entitlements e
  where e.user_id = v_user_id
    and e.programme_id = p_programme_id
    and e.status = 'active'
    and (e.valid_until is null or e.valid_until > now())
  order by
    case e.entitlement_type
      when 'permanent_purchase' then 0
      when 'subscription' then 1
      else 2
    end,
    e.valid_until desc nulls first,
    e.granted_at desc
  limit 1;

  if not found then
    raise exception 'active_entitlement_required';
  end if;

  select pp.id into v_phase_id
  from public.programme_phases pp
  where pp.programme_id = p_programme_id
    and pp.status = 'published'
  order by pp.sort_order, pp.id
  limit 1;

  if v_phase_id is null then
    raise exception 'programme_content_not_ready';
  end if;

  select ps.id into v_session_id
  from public.programme_sessions ps
  where ps.phase_id = v_phase_id
    and ps.status = 'published'
  order by ps.sort_order, ps.id
  limit 1;

  if v_session_id is null then
    raise exception 'programme_content_not_ready';
  end if;

  select coalesce(max(pe.cycle_number), 0) + 1 into v_cycle
  from public.programme_enrollments pe
  where pe.user_id = v_user_id
    and pe.programme_id = p_programme_id;

  insert into public.programme_enrollments (
    user_id,
    programme_id,
    entitlement_id,
    cycle_number,
    status,
    current_phase_id,
    current_session_id,
    enrolled_at,
    started_at,
    last_activity_at
  ) values (
    v_user_id,
    p_programme_id,
    v_entitlement.id,
    v_cycle,
    'active',
    v_phase_id,
    v_session_id,
    now(),
    now(),
    now()
  )
  returning * into v_enrollment;

  return query select
    v_enrollment.id,
    v_enrollment.programme_id,
    v_enrollment.entitlement_id,
    v_enrollment.cycle_number,
    v_enrollment.status,
    v_enrollment.current_phase_id,
    v_enrollment.current_session_id,
    v_enrollment.started_at;
end;
$$;

revoke all on function public.start_programme_enrollment(integer) from public, anon;
grant execute on function public.start_programme_enrollment(integer) to authenticated;
comment on function public.start_programme_enrollment(integer) is 'M11 explicit start action. Requires an active M10 entitlement and published programme content. Repeated calls are idempotent while an active/paused enrollment exists.';

create or replace function public.pause_programme_enrollment(p_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  update public.programme_enrollments
  set status = 'paused',
      paused_at = now(),
      last_activity_at = now()
  where id = p_enrollment_id
    and user_id = v_user_id
    and status = 'active';

  if not found then raise exception 'active_enrollment_not_found'; end if;
end;
$$;
revoke all on function public.pause_programme_enrollment(uuid) from public, anon;
grant execute on function public.pause_programme_enrollment(uuid) to authenticated;

create or replace function public.resume_programme_enrollment(p_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  v_user_id uuid := auth.uid();
  v_programme_id integer;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select programme_id into v_programme_id
  from public.programme_enrollments
  where id = p_enrollment_id
    and user_id = v_user_id
    and status = 'paused'
  for update;

  if v_programme_id is null then raise exception 'paused_enrollment_not_found'; end if;

  if not app_private.user_has_programme_entitlement(v_user_id, v_programme_id) then
    raise exception 'active_entitlement_required';
  end if;

  update public.programme_enrollments
  set status = 'active',
      paused_at = null,
      last_activity_at = now()
  where id = p_enrollment_id;
end;
$$;
revoke all on function public.resume_programme_enrollment(uuid) from public, anon;
grant execute on function public.resume_programme_enrollment(uuid) to authenticated;