import { getSupabaseClient } from "@/integrations/supabase/client";

export type PatientHomeAction =
  | "resume_session"
  | "resume_programme"
  | "start_programme"
  | "content_not_ready";

export type PatientHomeEnrollmentStatus = "active" | "paused" | null;

export interface PatientHomeProgramme {
  programmeId: number;
  programmeTitle: string;
  entitlementId: string;
  entitlementType: "permanent_purchase" | "subscription" | "manual";
  entitlementStatus: "active";
  grantedAt: string;
  contentReady: boolean;
  enrollmentId: string | null;
  enrollmentStatus: PatientHomeEnrollmentStatus;
  cycleNumber: number | null;
  currentPhaseId: string | null;
  currentPhaseTitle: string | null;
  currentSessionId: string | null;
  currentSessionTitle: string | null;
  lastActivityAt: string | null;
  todayAction: PatientHomeAction;
}

const getClient = () => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
};

export async function fetchPatientAppHome(language: "fr" | "en" | "de"): Promise<PatientHomeProgramme[]> {
  const { data, error } = await getClient().rpc("get_patient_app_home", {
    p_language: language,
  });

  if (error) throw new Error(error.message);

  return (Array.isArray(data) ? data : []).map((row: any) => ({
    programmeId: Number(row.programme_id),
    programmeTitle: String(row.programme_title ?? ""),
    entitlementId: String(row.entitlement_id),
    entitlementType: String(row.entitlement_type) as PatientHomeProgramme["entitlementType"],
    entitlementStatus: "active",
    grantedAt: String(row.granted_at),
    contentReady: Boolean(row.content_ready),
    enrollmentId: row.enrollment_id == null ? null : String(row.enrollment_id),
    enrollmentStatus: row.enrollment_status == null ? null : String(row.enrollment_status) as PatientHomeEnrollmentStatus,
    cycleNumber: row.cycle_number == null ? null : Number(row.cycle_number),
    currentPhaseId: row.current_phase_id == null ? null : String(row.current_phase_id),
    currentPhaseTitle: row.current_phase_title == null || row.current_phase_title === "" ? null : String(row.current_phase_title),
    currentSessionId: row.current_session_id == null ? null : String(row.current_session_id),
    currentSessionTitle: row.current_session_title == null || row.current_session_title === "" ? null : String(row.current_session_title),
    lastActivityAt: row.last_activity_at == null ? null : String(row.last_activity_at),
    todayAction: String(row.today_action) as PatientHomeAction,
  }));
}
