delete from public.admin_role_permissions
where permission_key = 'customers.assign'
  and role_key <> 'super_admin';

insert into public.admin_role_permissions(role_key, permission_key)
values ('super_admin','customers.read_assigned')
on conflict do nothing;

comment on table public.admin_customer_assignments is 'Operational distribution of customer accounts among Customer Admins. Only Super Admin may assign or reassign customers. No clinical answers or health data are stored here.';