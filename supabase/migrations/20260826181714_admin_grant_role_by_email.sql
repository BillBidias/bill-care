create or replace function public.admin_grant_role_by_email(
  p_email text,
  p_role_key text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  v_actor uuid := auth.uid();
  v_target uuid;
begin
  if v_actor is null then raise exception 'authentication_required'; end if;
  if not app_private.admin_has_permission(v_actor, 'admins.manage') then raise exception 'admin_permission_required'; end if;
  if p_email is null or btrim(p_email) = '' then raise exception 'email_required'; end if;
  if not exists (select 1 from public.admin_roles where role_key = p_role_key) then raise exception 'admin_role_not_found'; end if;

  select id into v_target
  from auth.users
  where lower(email) = lower(btrim(p_email))
  limit 1;

  if v_target is null then raise exception 'target_user_not_found'; end if;

  insert into public.admin_memberships(user_id, role_key, is_active, created_by, created_at, updated_at)
  values (v_target, p_role_key, true, v_actor, now(), now())
  on conflict (user_id, role_key) do update set
    is_active = true,
    created_by = v_actor,
    updated_at = now();

  insert into public.admin_audit_log(actor_user_id, action_key, target_user_id, metadata)
  values (v_actor, 'admin.role_granted', v_target, jsonb_build_object('role_key', p_role_key, 'via', 'email'));

  return v_target;
end;
$$;

revoke all on function public.admin_grant_role_by_email(text, text) from public, anon;
grant execute on function public.admin_grant_role_by_email(text, text) to authenticated;

comment on function public.admin_grant_role_by_email(text, text) is 'Allows only an administrator with admins.manage (currently Super Admin) to grant an admin role to an existing registered account identified by exact email.';