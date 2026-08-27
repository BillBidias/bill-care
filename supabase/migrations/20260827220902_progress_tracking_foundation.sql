create table public.programme_exercise_completions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.programme_enrollments(id) on delete cascade,
  prescription_id uuid not null references public.programme_session_exercises(id) on delete restrict,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (enrollment_id, prescription_id)
);

comment on table public.programme_exercise_completions is 'M14 factual progress events: one completed prescribed exercise within one programme enrollment. Stores completion only, not symptoms, diagnoses or clinical questionnaire answers.';

create index programme_exercise_completions_enrollment_idx
on public.programme_exercise_completions(enrollment_id, completed_at);

create table public.programme_session_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.programme_enrollments(id) on delete cascade,
  session_id uuid not null references public.programme_sessions(id) on delete restrict,
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (enrollment_id, session_id),
  check (status <> 'completed' or completed_at is not null)
);

comment on table public.programme_session_progress is 'M14 factual session progress derived from completed prescribed exercises. A session completes when all published non-optional prescriptions are completed.';

create index programme_session_progress_enrollment_idx
on public.programme_session_progress(enrollment_id, status);

create trigger programme_session_progress_touch_updated_at
before update on public.programme_session_progress
for each row execute function app_private.touch_content_updated_at();

alter table public.programme_exercise_completions enable row level security;
alter table public.programme_session_progress enable row level security;

revoke all on public.programme_exercise_completions, public.programme_session_progress from anon, authenticated;
grant select on public.programme_exercise_completions, public.programme_session_progress to authenticated;

create policy programme_exercise_completions_select_own
on public.programme_exercise_completions
for select to authenticated
using (
  exists (
    select 1 from public.programme_enrollments pe
    where pe.id = programme_exercise_completions.enrollment_id
      and pe.user_id = auth.uid()
  )
);

create policy programme_session_progress_select_own
on public.programme_session_progress
for select to authenticated
using (
  exists (
    select 1 from public.programme_enrollments pe
    where pe.id = programme_session_progress.enrollment_id
      and pe.user_id = auth.uid()
  )
);

create or replace function app_private.enrollment_progress_counts(p_enrollment_id uuid)
returns table (
  completed_exercises integer,
  total_exercises integer,
  completed_sessions integer,
  total_sessions integer,
  progress_percent integer
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  with enrollment as (
    select pe.id, pe.programme_id
    from public.programme_enrollments pe
    where pe.id = p_enrollment_id
  ),
  eligible_sessions as (
    select ps.id
    from enrollment en
    join public.programme_phases pp on pp.programme_id = en.programme_id and pp.status = 'published'
    join public.programme_sessions ps on ps.phase_id = pp.id and ps.status = 'published'
    where exists (
      select 1
      from public.programme_session_exercises pse
      join public.exercises e on e.id = pse.exercise_id and e.status = 'published'
      where pse.session_id = ps.id and pse.is_optional = false
    )
  ),
  eligible_prescriptions as (
    select pse.id
    from eligible_sessions es
    join public.programme_session_exercises pse on pse.session_id = es.id and pse.is_optional = false
    join public.exercises e on e.id = pse.exercise_id and e.status = 'published'
  ),
  exercise_counts as (
    select
      count(pec.id)::integer as completed_exercises,
      (select count(*)::integer from eligible_prescriptions) as total_exercises
    from public.programme_exercise_completions pec
    join eligible_prescriptions ep on ep.id = pec.prescription_id
    where pec.enrollment_id = p_enrollment_id
  ),
  session_counts as (
    select
      count(psp.id) filter (where psp.status = 'completed')::integer as completed_sessions,
      (select count(*)::integer from eligible_sessions) as total_sessions
    from public.programme_session_progress psp
    join eligible_sessions es on es.id = psp.session_id
    where psp.enrollment_id = p_enrollment_id
  )
  select
    ec.completed_exercises,
    ec.total_exercises,
    sc.completed_sessions,
    sc.total_sessions,
    case
      when ec.total_exercises = 0 then 0
      else least(100, round((ec.completed_exercises::numeric / ec.total_exercises::numeric) * 100)::integer)
    end
  from exercise_counts ec cross join session_counts sc;
$$;

revoke all on function app_private.enrollment_progress_counts(uuid) from public, anon;
grant execute on function app_private.enrollment_progress_counts(uuid) to authenticated, service_role;

create or replace function public.get_my_programme_progress()
returns table (
  enrollment_id uuid,
  programme_id integer,
  enrollment_status text,
  completed_exercises integer,
  total_exercises integer,
  completed_sessions integer,
  total_sessions integer,
  progress_percent integer
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  return query
  select
    pe.id,
    pe.programme_id,
    pe.status,
    pc.completed_exercises,
    pc.total_exercises,
    pc.completed_sessions,
    pc.total_sessions,
    pc.progress_percent
  from public.programme_enrollments pe
  cross join lateral app_private.enrollment_progress_counts(pe.id) pc
  where pe.user_id = v_user_id
  order by pe.started_at desc;
end;
$$;

revoke all on function public.get_my_programme_progress() from public, anon;
grant execute on function public.get_my_programme_progress() to authenticated;

create or replace function public.get_enrollment_completed_exercises(p_enrollment_id uuid)
returns table (prescription_id uuid, completed_at timestamptz)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if not exists (
    select 1 from public.programme_enrollments pe
    where pe.id = p_enrollment_id and pe.user_id = v_user_id
  ) then
    raise exception 'enrollment_not_found';
  end if;

  return query
  select pec.prescription_id, pec.completed_at
  from public.programme_exercise_completions pec
  where pec.enrollment_id = p_enrollment_id
  order by pec.completed_at, pec.prescription_id;
end;
$$;

revoke all on function public.get_enrollment_completed_exercises(uuid) from public, anon;
grant execute on function public.get_enrollment_completed_exercises(uuid) to authenticated;

create or replace function public.complete_programme_exercise(
  p_enrollment_id uuid,
  p_prescription_id uuid
)
returns table (
  exercise_completed boolean,
  session_completed boolean,
  programme_completed boolean,
  next_phase_id uuid,
  next_session_id uuid,
  completed_exercises integer,
  total_exercises integer,
  completed_sessions integer,
  total_sessions integer,
  progress_percent integer
)
language plpgsql
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  v_user_id uuid := auth.uid();
  v_enrollment public.programme_enrollments%rowtype;
  v_prescription public.programme_session_exercises%rowtype;
  v_phase_id uuid;
  v_required_total integer;
  v_required_completed integer;
  v_session_completed boolean := false;
  v_programme_completed boolean := false;
  v_next_phase uuid;
  v_next_session uuid;
  v_counts record;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if p_enrollment_id is null or p_prescription_id is null then raise exception 'invalid_progress_request'; end if;

  select * into v_enrollment
  from public.programme_enrollments pe
  where pe.id = p_enrollment_id
    and pe.user_id = v_user_id
  for update;

  if not found then raise exception 'enrollment_not_found'; end if;
  if v_enrollment.status <> 'active' then raise exception 'active_enrollment_required'; end if;
  if v_enrollment.current_session_id is null or v_enrollment.current_phase_id is null then raise exception 'current_session_not_available'; end if;
  if not app_private.user_has_programme_entitlement(v_user_id, v_enrollment.programme_id) then raise exception 'active_entitlement_required'; end if;

  select pse.* into v_prescription
  from public.programme_session_exercises pse
  join public.exercises e on e.id = pse.exercise_id and e.status = 'published'
  where pse.id = p_prescription_id
    and pse.session_id = v_enrollment.current_session_id;

  if not found then raise exception 'exercise_not_in_current_session'; end if;

  if not exists (
    select 1
    from public.programme_sessions ps
    join public.programme_phases pp on pp.id = ps.phase_id
    where ps.id = v_enrollment.current_session_id
      and ps.status = 'published'
      and pp.id = v_enrollment.current_phase_id
      and pp.programme_id = v_enrollment.programme_id
      and pp.status = 'published'
  ) then
    raise exception 'programme_content_not_ready';
  end if;

  insert into public.programme_exercise_completions(enrollment_id, prescription_id, completed_at)
  values (v_enrollment.id, v_prescription.id, now())
  on conflict (enrollment_id, prescription_id) do nothing;

  insert into public.programme_session_progress(enrollment_id, session_id, status, started_at)
  values (v_enrollment.id, v_enrollment.current_session_id, 'in_progress', now())
  on conflict (enrollment_id, session_id) do nothing;

  select count(*)::integer into v_required_total
  from public.programme_session_exercises pse
  join public.exercises e on e.id = pse.exercise_id and e.status = 'published'
  where pse.session_id = v_enrollment.current_session_id
    and pse.is_optional = false;

  select count(*)::integer into v_required_completed
  from public.programme_exercise_completions pec
  join public.programme_session_exercises pse on pse.id = pec.prescription_id
  join public.exercises e on e.id = pse.exercise_id and e.status = 'published'
  where pec.enrollment_id = v_enrollment.id
    and pse.session_id = v_enrollment.current_session_id
    and pse.is_optional = false;

  if v_required_total > 0 and v_required_completed >= v_required_total then
    v_session_completed := true;

    update public.programme_session_progress
    set status = 'completed', completed_at = coalesce(completed_at, now())
    where enrollment_id = v_enrollment.id
      and session_id = v_enrollment.current_session_id;

    select ps.id into v_next_session
    from public.programme_sessions current_ps
    join public.programme_sessions ps on ps.phase_id = current_ps.phase_id
    where current_ps.id = v_enrollment.current_session_id
      and ps.status = 'published'
      and ps.sort_order > current_ps.sort_order
    order by ps.sort_order, ps.id
    limit 1;

    if v_next_session is not null then
      v_next_phase := v_enrollment.current_phase_id;
    else
      select pp.id into v_next_phase
      from public.programme_phases current_pp
      join public.programme_phases pp on pp.programme_id = current_pp.programme_id
      where current_pp.id = v_enrollment.current_phase_id
        and pp.status = 'published'
        and pp.sort_order > current_pp.sort_order
      order by pp.sort_order, pp.id
      limit 1;

      if v_next_phase is not null then
        select ps.id into v_next_session
        from public.programme_sessions ps
        where ps.phase_id = v_next_phase
          and ps.status = 'published'
        order by ps.sort_order, ps.id
        limit 1;
      end if;
    end if;

    if v_next_session is null then
      v_programme_completed := true;
      update public.programme_enrollments
      set status = 'completed',
          completed_at = coalesce(completed_at, now()),
          last_activity_at = now()
      where id = v_enrollment.id;
    else
      update public.programme_enrollments
      set current_phase_id = v_next_phase,
          current_session_id = v_next_session,
          last_activity_at = now()
      where id = v_enrollment.id;
    end if;
  else
    update public.programme_enrollments
    set last_activity_at = now()
    where id = v_enrollment.id;
    v_next_phase := v_enrollment.current_phase_id;
    v_next_session := v_enrollment.current_session_id;
  end if;

  select * into v_counts from app_private.enrollment_progress_counts(v_enrollment.id);

  return query select
    true,
    v_session_completed,
    v_programme_completed,
    v_next_phase,
    v_next_session,
    v_counts.completed_exercises,
    v_counts.total_exercises,
    v_counts.completed_sessions,
    v_counts.total_sessions,
    case when v_programme_completed then 100 else v_counts.progress_percent end;
end;
$$;

revoke all on function public.complete_programme_exercise(uuid, uuid) from public, anon;
grant execute on function public.complete_programme_exercise(uuid, uuid) to authenticated;

comment on function public.complete_programme_exercise(uuid, uuid) is 'M14 patient-owned progress mutation. Marks one prescribed exercise complete, completes the current session when all published mandatory prescriptions are done, advances to the next published session/phase, and completes the enrollment at the end of the programme. Entitlement remains authoritative.';