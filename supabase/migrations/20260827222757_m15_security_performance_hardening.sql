-- M15: safe pre-production hardening. No business or clinical semantics are changed.

-- Cover high-value foreign keys used by audit, payment, entitlement and progress paths.
create index if not exists admin_audit_log_actor_user_id_idx
  on public.admin_audit_log(actor_user_id);
create index if not exists admin_audit_log_target_user_id_idx
  on public.admin_audit_log(target_user_id);
create index if not exists admin_customer_assignments_assigned_by_idx
  on public.admin_customer_assignments(assigned_by);
create index if not exists entitlements_source_order_id_idx
  on public.entitlements(source_order_id);
create index if not exists payment_events_payment_attempt_id_idx
  on public.payment_events(payment_attempt_id);
create index if not exists payment_events_order_id_idx
  on public.payment_events(order_id);
create index if not exists programme_exercise_completions_prescription_id_idx
  on public.programme_exercise_completions(prescription_id);
create index if not exists programme_session_progress_session_id_idx
  on public.programme_session_progress(session_id);

-- Avoid re-evaluating auth.uid() once per candidate row in RLS policies.
alter policy payment_attempts_select_own on public.payment_attempts
  using (exists (
    select 1 from public.orders o
    where o.id = payment_attempts.order_id
      and o.user_id = (select auth.uid())
  ));

alter policy entitlements_select_own on public.entitlements
  using (user_id = (select auth.uid()));

alter policy programme_phases_entitled_read on public.programme_phases
  using (
    status = 'published'
    and app_private.user_has_programme_entitlement((select auth.uid()), programme_id)
  );

alter policy programme_phase_translations_entitled_read on public.programme_phase_translations
  using (exists (
    select 1 from public.programme_phases pp
    where pp.id = programme_phase_translations.phase_id
      and pp.status = 'published'
      and app_private.user_has_programme_entitlement((select auth.uid()), pp.programme_id)
  ));

alter policy programme_sessions_entitled_read on public.programme_sessions
  using (
    status = 'published'
    and exists (
      select 1 from public.programme_phases pp
      where pp.id = programme_sessions.phase_id
        and pp.status = 'published'
        and app_private.user_has_programme_entitlement((select auth.uid()), pp.programme_id)
    )
  );

alter policy programme_session_translations_entitled_read on public.programme_session_translations
  using (exists (
    select 1
    from public.programme_sessions ps
    join public.programme_phases pp on pp.id = ps.phase_id
    where ps.id = programme_session_translations.session_id
      and ps.status = 'published'
      and pp.status = 'published'
      and app_private.user_has_programme_entitlement((select auth.uid()), pp.programme_id)
  ));

alter policy programme_session_exercises_entitled_read on public.programme_session_exercises
  using (exists (
    select 1
    from public.programme_sessions ps
    join public.programme_phases pp on pp.id = ps.phase_id
    join public.exercises e on e.id = programme_session_exercises.exercise_id
    where ps.id = programme_session_exercises.session_id
      and ps.status = 'published'
      and pp.status = 'published'
      and e.status = 'published'
      and app_private.user_has_programme_entitlement((select auth.uid()), pp.programme_id)
  ));

alter policy exercises_entitled_read on public.exercises
  using (
    status = 'published'
    and app_private.user_has_exercise_entitlement((select auth.uid()), id)
  );

alter policy exercise_translations_entitled_read on public.exercise_translations
  using (exists (
    select 1 from public.exercises e
    where e.id = exercise_translations.exercise_id
      and e.status = 'published'
      and app_private.user_has_exercise_entitlement((select auth.uid()), e.id)
  ));

alter policy exercise_variants_entitled_read on public.exercise_variants
  using (
    status = 'published'
    and exists (
      select 1 from public.exercises e
      where e.id = exercise_variants.exercise_id
        and e.status = 'published'
        and app_private.user_has_exercise_entitlement((select auth.uid()), e.id)
    )
  );

alter policy exercise_variant_translations_entitled_read on public.exercise_variant_translations
  using (exists (
    select 1
    from public.exercise_variants ev
    join public.exercises e on e.id = ev.exercise_id
    where ev.id = exercise_variant_translations.variant_id
      and ev.status = 'published'
      and e.status = 'published'
      and app_private.user_has_exercise_entitlement((select auth.uid()), e.id)
  ));

alter policy programme_enrollments_select_own on public.programme_enrollments
  using (user_id = (select auth.uid()));

alter policy programme_exercise_completions_select_own on public.programme_exercise_completions
  using (exists (
    select 1 from public.programme_enrollments pe
    where pe.id = programme_exercise_completions.enrollment_id
      and pe.user_id = (select auth.uid())
  ));

alter policy programme_session_progress_select_own on public.programme_session_progress
  using (exists (
    select 1 from public.programme_enrollments pe
    where pe.id = programme_session_progress.enrollment_id
      and pe.user_id = (select auth.uid())
  ));