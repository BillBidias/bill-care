-- P05 — Auth & RPC Hardening
-- Scope: reduce unnecessary authenticated EXECUTE grants on internal helpers
-- and make future postgres-owned functions default-deny for browser roles.
--
-- MUST PRESERVE:
-- - public RPCs intentionally used by Patient App, checkout and Admin
-- - entitlement helpers required by RLS policies
-- - Stripe payment mutation RPCs restricted to service_role
-- - existing Auth/RLS/clinical safety/payment behavior

-- Future postgres-owned functions must not inherit EXECUTE through PUBLIC.
alter default privileges for role postgres
  revoke execute on functions from public;

-- Future functions in public must require explicit grants for browser roles.
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;

-- Future internal helpers in app_private must not be executable by browser roles.
alter default privileges for role postgres in schema app_private
  revoke execute on functions from anon, authenticated;

-- These helpers are invoked only from privileged public RPCs, not directly by RLS
-- and do not need direct authenticated EXECUTE.
revoke execute on function app_private.admin_can_view_customer(uuid, uuid) from authenticated;
revoke execute on function app_private.admin_has_permission(uuid, text) from authenticated;
revoke execute on function app_private.enrollment_progress_counts(uuid) from authenticated;

-- Intentionally preserved authenticated grants:
-- app_private.user_has_programme_entitlement(uuid, integer)
-- app_private.user_has_exercise_entitlement(uuid, uuid)
-- These are referenced directly by RLS policies and must remain callable during
-- authenticated policy evaluation.
