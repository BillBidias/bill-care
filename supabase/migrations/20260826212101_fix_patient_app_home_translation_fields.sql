create or replace function public.get_patient_app_home(p_language text default 'fr')
returns table (
  programme_id integer,
  programme_title text,
  entitlement_id uuid,
  entitlement_type text,
  entitlement_status text,
  granted_at timestamptz,
  content_ready boolean,
  enrollment_id uuid,
  enrollment_status text,
  cycle_number integer,
  current_phase_id uuid,
  current_phase_title text,
  current_session_id uuid,
  current_session_title text,
  last_activity_at timestamptz,
  today_action text
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  v_user_id uuid := auth.uid();
  v_language text := case when p_language in ('fr','en','de') then p_language else 'fr' end;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;

  return query
  with active_entitlements as (
    select distinct on (e.programme_id)
      e.id,
      e.programme_id,
      e.entitlement_type,
      e.status,
      e.granted_at,
      e.valid_until
    from public.entitlements e
    where e.user_id = v_user_id
      and e.status = 'active'
      and (e.valid_until is null or e.valid_until > now())
    order by e.programme_id,
      case e.entitlement_type
        when 'permanent_purchase' then 0
        when 'subscription' then 1
        else 2
      end,
      e.valid_until desc nulls first,
      e.granted_at desc
  ),
  latest_open_enrollment as (
    select distinct on (pe.programme_id)
      pe.*
    from public.programme_enrollments pe
    where pe.user_id = v_user_id
      and pe.status in ('active','paused')
    order by pe.programme_id, pe.cycle_number desc, pe.last_activity_at desc
  )
  select
    p.id,
    coalesce(p.title->>v_language, p.title->>'fr', p.title->>'en', p.title->>'de', 'Programme ' || p.id::text),
    ae.id,
    ae.entitlement_type,
    ae.status,
    ae.granted_at,
    exists (
      select 1
      from public.programme_phases ready_phase
      join public.programme_sessions ready_session on ready_session.phase_id = ready_phase.id
      where ready_phase.programme_id = p.id
        and ready_phase.status = 'published'
        and ready_session.status = 'published'
    ) as content_ready,
    pe.id,
    pe.status,
    pe.cycle_number,
    pe.current_phase_id,
    ppt.name,
    pe.current_session_id,
    pst.name,
    pe.last_activity_at,
    case
      when pe.status = 'active' and pe.current_session_id is not null then 'resume_session'
      when pe.status = 'paused' then 'resume_programme'
      when pe.id is null and exists (
        select 1
        from public.programme_phases ready_phase
        join public.programme_sessions ready_session on ready_session.phase_id = ready_phase.id
        where ready_phase.programme_id = p.id
          and ready_phase.status = 'published'
          and ready_session.status = 'published'
      ) then 'start_programme'
      else 'content_not_ready'
    end
  from active_entitlements ae
  join public.programmes p on p.id = ae.programme_id
  left join latest_open_enrollment pe on pe.programme_id = p.id
  left join lateral (
    select pptx.name
    from public.programme_phase_translations pptx
    where pptx.phase_id = pe.current_phase_id
      and pptx.language in (v_language, 'fr', 'en', 'de')
    order by case pptx.language when v_language then 0 when 'fr' then 1 when 'en' then 2 else 3 end
    limit 1
  ) ppt on true
  left join lateral (
    select pstx.name
    from public.programme_session_translations pstx
    where pstx.session_id = pe.current_session_id
      and pstx.language in (v_language, 'fr', 'en', 'de')
    order by case pstx.language when v_language then 0 when 'fr' then 1 when 'en' then 2 else 3 end
    limit 1
  ) pst on true
  where p.status = 'published'
  order by
    case
      when pe.status = 'active' then 0
      when pe.status = 'paused' then 1
      when pe.id is null then 2
      else 3
    end,
    coalesce(pe.last_activity_at, ae.granted_at) desc,
    p.id;
end;
$$;

revoke all on function public.get_patient_app_home(text) from public, anon;
grant execute on function public.get_patient_app_home(text) to authenticated;