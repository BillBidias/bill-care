import { getSupabaseClient } from "@/integrations/supabase/client";

export interface ProgrammeProgress {
  enrollmentId: string;
  programmeId: number;
  enrollmentStatus: "active" | "paused" | "completed" | "cancelled";
  completedExercises: number;
  totalExercises: number;
  completedSessions: number;
  totalSessions: number;
  progressPercent: number;
}

export interface ExerciseCompletionResult {
  exerciseCompleted: boolean;
  sessionCompleted: boolean;
  programmeCompleted: boolean;
  nextPhaseId: string | null;
  nextSessionId: string | null;
  completedExercises: number;
  totalExercises: number;
  completedSessions: number;
  totalSessions: number;
  progressPercent: number;
}

type RpcRow = Record<string, unknown>;

interface ProgressRow {
  enrollment_id?: unknown;
  programme_id?: unknown;
  enrollment_status?: unknown;
  completed_exercises?: unknown;
  total_exercises?: unknown;
  completed_sessions?: unknown;
  total_sessions?: unknown;
  progress_percent?: unknown;
}

interface PrescriptionRow {
  prescription_id?: unknown;
}

const getClient = () => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
};

const firstRow = (data: unknown): RpcRow | null =>
  Array.isArray(data) ? (data[0] ?? null) as RpcRow | null : (data as RpcRow | null);

export async function fetchMyProgrammeProgress(): Promise<ProgrammeProgress[]> {
  const { data, error } = await getClient().rpc("get_my_programme_progress");
  if (error) throw new Error(error.message);

  return (Array.isArray(data) ? data : []).map((row: ProgressRow) => ({
    enrollmentId: String(row.enrollment_id),
    programmeId: Number(row.programme_id),
    enrollmentStatus: String(row.enrollment_status) as ProgrammeProgress["enrollmentStatus"],
    completedExercises: Number(row.completed_exercises ?? 0),
    totalExercises: Number(row.total_exercises ?? 0),
    completedSessions: Number(row.completed_sessions ?? 0),
    totalSessions: Number(row.total_sessions ?? 0),
    progressPercent: Math.max(0, Math.min(100, Number(row.progress_percent ?? 0))),
  }));
}

export async function fetchCompletedExerciseIds(enrollmentId: string): Promise<Set<string>> {
  const { data, error } = await getClient().rpc("get_enrollment_completed_exercises", {
    p_enrollment_id: enrollmentId,
  });
  if (error) throw new Error(error.message);
  return new Set((Array.isArray(data) ? data : []).map((row: PrescriptionRow) => String(row.prescription_id)));
}

export async function completeProgrammeExercise(
  enrollmentId: string,
  prescriptionId: string,
): Promise<ExerciseCompletionResult> {
  const { data, error } = await getClient().rpc("complete_programme_exercise", {
    p_enrollment_id: enrollmentId,
    p_prescription_id: prescriptionId,
  });
  if (error) throw new Error(error.message);
  const row = firstRow(data);
  if (!row) throw new Error("progress_update_failed");

  return {
    exerciseCompleted: Boolean(row.exercise_completed),
    sessionCompleted: Boolean(row.session_completed),
    programmeCompleted: Boolean(row.programme_completed),
    nextPhaseId: row.next_phase_id == null ? null : String(row.next_phase_id),
    nextSessionId: row.next_session_id == null ? null : String(row.next_session_id),
    completedExercises: Number(row.completed_exercises ?? 0),
    totalExercises: Number(row.total_exercises ?? 0),
    completedSessions: Number(row.completed_sessions ?? 0),
    totalSessions: Number(row.total_sessions ?? 0),
    progressPercent: Math.max(0, Math.min(100, Number(row.progress_percent ?? 0))),
  };
}
