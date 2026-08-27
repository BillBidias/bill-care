import { getSupabaseClient } from "@/integrations/supabase/client";

export type CoreLanguage = "fr" | "en" | "de";

export interface SessionExercise {
  prescriptionId: string;
  exerciseId: string;
  sortOrder: number;
  name: string;
  target: string | null;
  startingPosition: string | null;
  movement: string | null;
  whyThisExercise: string | null;
  mainTip: string | null;
  commonMistakes: string | null;
  safetyInstructions: string | null;
  stopCriteria: string | null;
  contraindications: string | null;
  sets: number | null;
  repetitions: number | null;
  holdSeconds: number | null;
  restSeconds: number | null;
  tempo: string | null;
  isOptional: boolean;
  videoAssetRef: string | null;
  thumbnailAssetRef: string | null;
  placeholderImage: string | null;
}

export interface PatientSessionExperience {
  enrollmentId: string;
  enrollmentStatus: "active" | "paused";
  programmeId: number;
  programmeTitle: string;
  programmeImage: string | null;
  phaseId: string;
  phaseName: string;
  phaseObjective: string | null;
  sessionId: string;
  sessionName: string;
  sessionIntro: string | null;
  sessionCompletionMessage: string | null;
  estimatedDurationMinutes: number | null;
  exercises: SessionExercise[];
}

const getClient = () => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
};

const localized = <T extends { language: string }>(rows: T[], language: CoreLanguage): T | null => {
  const order = [language, "fr", "en", "de"];
  for (const code of order) {
    const found = rows.find((row) => row.language === code);
    if (found) return found;
  }
  return rows[0] ?? null;
};

const programmeText = (value: unknown, language: CoreLanguage, fallback: string): string => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const record = value as Record<string, unknown>;
  for (const code of [language, "fr", "en", "de"]) {
    const candidate = record[code];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return fallback;
};

export async function fetchPatientSessionExperience(
  enrollmentId: string,
  language: CoreLanguage,
): Promise<PatientSessionExperience> {
  const client = getClient();

  const { data: enrollment, error: enrollmentError } = await client
    .from("programme_enrollments")
    .select("id, programme_id, status, current_phase_id, current_session_id")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (enrollmentError) throw new Error("session.load_failed");
  if (!enrollment || !["active", "paused"].includes(enrollment.status)) {
    throw new Error("session.not_available");
  }
  if (!enrollment.current_phase_id || !enrollment.current_session_id) {
    throw new Error("session.not_ready");
  }

  const [programmeResult, phaseResult, phaseTranslationsResult, sessionResult, sessionTranslationsResult, prescriptionsResult] =
    await Promise.all([
      client
        .from("programmes")
        .select("id, title, image, status")
        .eq("id", enrollment.programme_id)
        .eq("status", "published")
        .maybeSingle(),
      client
        .from("programme_phases")
        .select("id, programme_id, status")
        .eq("id", enrollment.current_phase_id)
        .eq("programme_id", enrollment.programme_id)
        .eq("status", "published")
        .maybeSingle(),
      client
        .from("programme_phase_translations")
        .select("phase_id, language, name, objective")
        .eq("phase_id", enrollment.current_phase_id),
      client
        .from("programme_sessions")
        .select("id, phase_id, status, estimated_duration_minutes")
        .eq("id", enrollment.current_session_id)
        .eq("phase_id", enrollment.current_phase_id)
        .eq("status", "published")
        .maybeSingle(),
      client
        .from("programme_session_translations")
        .select("session_id, language, name, intro, completion_message")
        .eq("session_id", enrollment.current_session_id),
      client
        .from("programme_session_exercises")
        .select("id, exercise_id, exercise_variant_id, sort_order, is_optional, sets_override, repetitions_override, hold_seconds_override, rest_seconds_override, tempo_override")
        .eq("session_id", enrollment.current_session_id)
        .order("sort_order", { ascending: true }),
    ]);

  if (programmeResult.error || phaseResult.error || sessionResult.error || prescriptionsResult.error) {
    throw new Error("session.load_failed");
  }
  if (!programmeResult.data || !phaseResult.data || !sessionResult.data) {
    throw new Error("session.not_available");
  }

  const prescriptions = prescriptionsResult.data ?? [];
  const exerciseIds = prescriptions.map((row) => row.exercise_id);

  const [exercisesResult, translationsResult] = exerciseIds.length
    ? await Promise.all([
        client
          .from("exercises")
          .select("id, status, default_sets, default_repetitions, default_hold_seconds, default_rest_seconds, default_tempo, video_asset_ref, thumbnail_asset_ref")
          .in("id", exerciseIds)
          .eq("status", "published"),
        client
          .from("exercise_translations")
          .select("exercise_id, language, name, target, starting_position, movement, why_this_exercise, main_tip, common_mistakes, safety_instructions, stop_criteria, contraindications")
          .in("exercise_id", exerciseIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  if (exercisesResult.error || translationsResult.error) throw new Error("session.load_failed");

  const exercisesById = new Map((exercisesResult.data ?? []).map((row) => [row.id, row]));
  const translations = translationsResult.data ?? [];
  const programmeImage = programmeResult.data.image == null ? null : String(programmeResult.data.image);

  const exercises: SessionExercise[] = prescriptions.flatMap((prescription) => {
    const exercise = exercisesById.get(prescription.exercise_id);
    if (!exercise) return [];
    const copy = localized(
      translations.filter((row) => row.exercise_id === prescription.exercise_id),
      language,
    );
    if (!copy) return [];

    return [{
      prescriptionId: String(prescription.id),
      exerciseId: String(prescription.exercise_id),
      sortOrder: Number(prescription.sort_order ?? 0),
      name: String(copy.name),
      target: copy.target == null ? null : String(copy.target),
      startingPosition: copy.starting_position == null ? null : String(copy.starting_position),
      movement: copy.movement == null ? null : String(copy.movement),
      whyThisExercise: copy.why_this_exercise == null ? null : String(copy.why_this_exercise),
      mainTip: copy.main_tip == null ? null : String(copy.main_tip),
      commonMistakes: copy.common_mistakes == null ? null : String(copy.common_mistakes),
      safetyInstructions: copy.safety_instructions == null ? null : String(copy.safety_instructions),
      stopCriteria: copy.stop_criteria == null ? null : String(copy.stop_criteria),
      contraindications: copy.contraindications == null ? null : String(copy.contraindications),
      sets: prescription.sets_override ?? exercise.default_sets ?? null,
      repetitions: prescription.repetitions_override ?? exercise.default_repetitions ?? null,
      holdSeconds: prescription.hold_seconds_override ?? exercise.default_hold_seconds ?? null,
      restSeconds: prescription.rest_seconds_override ?? exercise.default_rest_seconds ?? null,
      tempo: prescription.tempo_override ?? exercise.default_tempo ?? null,
      isOptional: Boolean(prescription.is_optional),
      videoAssetRef: exercise.video_asset_ref == null ? null : String(exercise.video_asset_ref),
      thumbnailAssetRef: exercise.thumbnail_asset_ref == null ? null : String(exercise.thumbnail_asset_ref),
      placeholderImage: programmeImage,
    }];
  });

  if (exercises.length === 0) throw new Error("session.content_not_ready");

  const phaseCopy = localized(phaseTranslationsResult.data ?? [], language);
  const sessionCopy = localized(sessionTranslationsResult.data ?? [], language);

  return {
    enrollmentId: String(enrollment.id),
    enrollmentStatus: enrollment.status as "active" | "paused",
    programmeId: Number(programmeResult.data.id),
    programmeTitle: programmeText(programmeResult.data.title, language, `Programme ${programmeResult.data.id}`),
    programmeImage,
    phaseId: String(phaseResult.data.id),
    phaseName: phaseCopy?.name ? String(phaseCopy.name) : "",
    phaseObjective: phaseCopy?.objective == null ? null : String(phaseCopy.objective),
    sessionId: String(sessionResult.data.id),
    sessionName: sessionCopy?.name ? String(sessionCopy.name) : "",
    sessionIntro: sessionCopy?.intro == null ? null : String(sessionCopy.intro),
    sessionCompletionMessage: sessionCopy?.completion_message == null ? null : String(sessionCopy.completion_message),
    estimatedDurationMinutes:
      sessionResult.data.estimated_duration_minutes == null
        ? null
        : Number(sessionResult.data.estimated_duration_minutes),
    exercises,
  };
}
