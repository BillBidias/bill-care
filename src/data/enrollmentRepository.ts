import { getSupabaseClient } from "@/integrations/supabase/client";

export type EnrollmentStatus = "active" | "paused" | "completed" | "cancelled";

export interface ProgrammeEnrollment {
  id: string;
  userId: string;
  programmeId: number;
  entitlementId: string;
  cycleNumber: number;
  status: EnrollmentStatus;
  currentPhaseId: string | null;
  currentSessionId: string | null;
  enrolledAt: string;
  startedAt: string;
  pausedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  lastActivityAt: string;
}

export interface StartProgrammeEnrollmentResult {
  enrollmentId: string;
  programmeId: number;
  entitlementId: string;
  cycleNumber: number;
  enrollmentStatus: EnrollmentStatus;
  currentPhaseId: string | null;
  currentSessionId: string | null;
  startedAt: string;
}

interface EnrollmentRow {
  id?: unknown;
  user_id?: unknown;
  programme_id?: unknown;
  entitlement_id?: unknown;
  cycle_number?: unknown;
  status?: unknown;
  current_phase_id?: unknown;
  current_session_id?: unknown;
  enrolled_at?: unknown;
  started_at?: unknown;
  paused_at?: unknown;
  completed_at?: unknown;
  cancelled_at?: unknown;
  last_activity_at?: unknown;
}

const getClient = () => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
};

export async function listOwnProgrammeEnrollments(): Promise<ProgrammeEnrollment[]> {
  const { data, error } = await getClient()
    .from("programme_enrollments")
    .select("id,user_id,programme_id,entitlement_id,cycle_number,status,current_phase_id,current_session_id,enrolled_at,started_at,paused_at,completed_at,cancelled_at,last_activity_at")
    .order("last_activity_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: EnrollmentRow) => ({
    id: String(row.id),
    userId: String(row.user_id),
    programmeId: Number(row.programme_id),
    entitlementId: String(row.entitlement_id),
    cycleNumber: Number(row.cycle_number),
    status: String(row.status) as EnrollmentStatus,
    currentPhaseId: row.current_phase_id == null ? null : String(row.current_phase_id),
    currentSessionId: row.current_session_id == null ? null : String(row.current_session_id),
    enrolledAt: String(row.enrolled_at),
    startedAt: String(row.started_at),
    pausedAt: row.paused_at == null ? null : String(row.paused_at),
    completedAt: row.completed_at == null ? null : String(row.completed_at),
    cancelledAt: row.cancelled_at == null ? null : String(row.cancelled_at),
    lastActivityAt: String(row.last_activity_at),
  }));
}

export async function startProgrammeEnrollment(programmeId: number): Promise<StartProgrammeEnrollmentResult> {
  const { data, error } = await getClient().rpc("start_programme_enrollment", {
    p_programme_id: programmeId,
  });

  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Enrollment could not be started.");

  return {
    enrollmentId: String(row.enrollment_id),
    programmeId: Number(row.programme_id),
    entitlementId: String(row.entitlement_id),
    cycleNumber: Number(row.cycle_number),
    enrollmentStatus: String(row.enrollment_status) as EnrollmentStatus,
    currentPhaseId: row.current_phase_id == null ? null : String(row.current_phase_id),
    currentSessionId: row.current_session_id == null ? null : String(row.current_session_id),
    startedAt: String(row.started_at),
  };
}

export async function pauseProgrammeEnrollment(enrollmentId: string): Promise<void> {
  const { error } = await getClient().rpc("pause_programme_enrollment", {
    p_enrollment_id: enrollmentId,
  });
  if (error) throw new Error(error.message);
}

export async function resumeProgrammeEnrollment(enrollmentId: string): Promise<void> {
  const { error } = await getClient().rpc("resume_programme_enrollment", {
    p_enrollment_id: enrollmentId,
  });
  if (error) throw new Error(error.message);
}
