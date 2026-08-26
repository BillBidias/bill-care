import { getSupabaseClient } from "@/integrations/supabase/client";

export type AdminRoleKey =
  | "super_admin"
  | "customer_manager"
  | "customer_admin"
  | "commerce_admin";

export interface AdminAccess {
  isAdmin: boolean;
  roleKeys: AdminRoleKey[];
  permissionKeys: string[];
}

export interface AdminDashboardSummary {
  visibleCustomers: number;
  customersWithPaidOrders: number;
  pendingOrders: number;
  paidOrders: number;
  revenueByCurrency: Record<string, number>;
  activeAdmins: number | null;
  assignedToMe: number;
  entitlementModuleActive: boolean;
  subscriptionModuleActive: boolean;
}

export interface AdminCustomer {
  userId: string;
  email: string;
  displayName: string | null;
  preferredLanguage: string | null;
  accountCreatedAt: string;
  lastSignInAt: string | null;
  orderCount: number;
  paidOrderCount: number;
  pendingOrderCount: number;
  totalPaidAmount: number;
  paidCurrency: string | null;
  assignedAdminIds: string[];
  primaryAdminId: string | null;
}

export interface AdminTeamMember {
  adminUserId: string;
  email: string;
  displayName: string | null;
  roleKeys: AdminRoleKey[];
  assignedCustomerCount: number;
}

const getClient = () => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
};

const firstRow = (data: unknown): any | null =>
  Array.isArray(data) ? (data[0] ?? null) : (data ?? null);

export function hasAdminPermission(access: AdminAccess | null, permission: string): boolean {
  return Boolean(access?.permissionKeys.includes(permission));
}

export async function fetchAdminAccess(): Promise<AdminAccess> {
  const { data, error } = await getClient().rpc("admin_get_my_access");
  if (error) throw new Error(error.message);
  const row = firstRow(data);
  if (!row) return { isAdmin: false, roleKeys: [], permissionKeys: [] };

  return {
    isAdmin: Boolean(row.is_admin),
    roleKeys: Array.isArray(row.role_keys) ? row.role_keys.map(String) as AdminRoleKey[] : [],
    permissionKeys: Array.isArray(row.permission_keys) ? row.permission_keys.map(String) : [],
  };
}

export async function fetchAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const { data, error } = await getClient().rpc("admin_get_dashboard_summary");
  if (error) throw new Error(error.message);
  const row = firstRow(data);
  if (!row) throw new Error("Admin dashboard summary is unavailable.");

  const revenue = row.revenue_by_currency && typeof row.revenue_by_currency === "object"
    ? Object.fromEntries(
        Object.entries(row.revenue_by_currency).map(([currency, amount]) => [currency, Number(amount)]),
      )
    : {};

  return {
    visibleCustomers: Number(row.visible_customers ?? 0),
    customersWithPaidOrders: Number(row.customers_with_paid_orders ?? 0),
    pendingOrders: Number(row.pending_orders ?? 0),
    paidOrders: Number(row.paid_orders ?? 0),
    revenueByCurrency: revenue,
    activeAdmins: row.active_admins == null ? null : Number(row.active_admins),
    assignedToMe: Number(row.assigned_to_me ?? 0),
    entitlementModuleActive: Boolean(row.entitlement_module_active),
    subscriptionModuleActive: Boolean(row.subscription_module_active),
  };
}

export async function listAdminCustomers(search = "", limit = 100, offset = 0): Promise<AdminCustomer[]> {
  const { data, error } = await getClient().rpc("admin_list_customers", {
    p_search: search.trim() || null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw new Error(error.message);

  return (Array.isArray(data) ? data : []).map((row: any) => ({
    userId: String(row.user_id),
    email: String(row.email ?? ""),
    displayName: row.display_name == null ? null : String(row.display_name),
    preferredLanguage: row.preferred_language == null ? null : String(row.preferred_language),
    accountCreatedAt: String(row.account_created_at),
    lastSignInAt: row.last_sign_in_at == null ? null : String(row.last_sign_in_at),
    orderCount: Number(row.order_count ?? 0),
    paidOrderCount: Number(row.paid_order_count ?? 0),
    pendingOrderCount: Number(row.pending_order_count ?? 0),
    totalPaidAmount: Number(row.total_paid_amount ?? 0),
    paidCurrency: row.paid_currency == null ? null : String(row.paid_currency),
    assignedAdminIds: Array.isArray(row.assigned_admin_ids) ? row.assigned_admin_ids.map(String) : [],
    primaryAdminId: row.primary_admin_id == null ? null : String(row.primary_admin_id),
  }));
}

export async function listAdminTeam(): Promise<AdminTeamMember[]> {
  const { data, error } = await getClient().rpc("admin_list_team");
  if (error) throw new Error(error.message);

  return (Array.isArray(data) ? data : []).map((row: any) => ({
    adminUserId: String(row.admin_user_id),
    email: String(row.email ?? ""),
    displayName: row.display_name == null ? null : String(row.display_name),
    roleKeys: Array.isArray(row.role_keys) ? row.role_keys.map(String) as AdminRoleKey[] : [],
    assignedCustomerCount: Number(row.assigned_customer_count ?? 0),
  }));
}

export async function grantAdminRoleByEmail(email: string, roleKey: AdminRoleKey): Promise<string> {
  const { data, error } = await getClient().rpc("admin_grant_role_by_email", {
    p_email: email.trim(),
    p_role_key: roleKey,
  });
  if (error) throw new Error(error.message);
  return String(data ?? "");
}

export async function revokeAdminRole(userId: string, roleKey: AdminRoleKey): Promise<void> {
  const { error } = await getClient().rpc("admin_revoke_role", {
    p_target_user_id: userId,
    p_role_key: roleKey,
  });
  if (error) throw new Error(error.message);
}

export async function assignCustomerToAdmin(
  customerUserId: string,
  adminUserId: string,
  isPrimary = true,
): Promise<void> {
  const { error } = await getClient().rpc("admin_assign_customer", {
    p_customer_user_id: customerUserId,
    p_admin_user_id: adminUserId,
    p_is_primary: isPrimary,
  });
  if (error) throw new Error(error.message);
}

export async function unassignCustomerFromAdmin(customerUserId: string, adminUserId: string): Promise<void> {
  const { error } = await getClient().rpc("admin_unassign_customer", {
    p_customer_user_id: customerUserId,
    p_admin_user_id: adminUserId,
  });
  if (error) throw new Error(error.message);
}
