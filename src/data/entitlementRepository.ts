import { getSupabaseClient } from "@/integrations/supabase/client";

export type EntitlementType = "permanent_purchase" | "subscription" | "manual";
export type EntitlementStatus = "active" | "revoked" | "expired";

export interface ProgrammeEntitlement {
  id: string;
  programmeId: number;
  entitlementType: EntitlementType;
  status: EntitlementStatus;
  sourceOrderId: string | null;
  grantedAt: string;
  validUntil: string | null;
}

export async function listOwnEntitlements(): Promise<ProgrammeEntitlement[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const { data, error } = await client
    .from("entitlements")
    .select("id, programme_id, entitlement_type, status, source_order_id, granted_at, valid_until")
    .order("granted_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    programmeId: Number(row.programme_id),
    entitlementType: row.entitlement_type as EntitlementType,
    status: row.status as EntitlementStatus,
    sourceOrderId: row.source_order_id == null ? null : String(row.source_order_id),
    grantedAt: String(row.granted_at),
    validUntil: row.valid_until == null ? null : String(row.valid_until),
  }));
}

export function isEntitlementCurrentlyUsable(entitlement: ProgrammeEntitlement, now = new Date()): boolean {
  if (entitlement.status !== "active") return false;
  if (!entitlement.validUntil) return true;
  return new Date(entitlement.validUntil).getTime() > now.getTime();
}

export async function hasOwnProgrammeEntitlement(programmeId: number): Promise<boolean> {
  if (!Number.isInteger(programmeId) || programmeId <= 0) return false;
  const entitlements = await listOwnEntitlements();
  return entitlements.some(
    (entitlement) => entitlement.programmeId === programmeId && isEntitlementCurrentlyUsable(entitlement),
  );
}
