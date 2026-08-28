import { getSupabaseClient } from "@/integrations/supabase/client";
import { fetchSafetyConfig, getApplicableSafetyQuestions, type SafetyQuestion } from "@/data/safetyRepository";
import type { LocalizedText } from "@/data/programs";

export interface CheckoutSafetyPreparation {
  questions: SafetyQuestion[];
  acknowledgement: {
    version: string;
    title: LocalizedText;
    body: LocalizedText;
    checkboxLabel: LocalizedText;
  };
}

export async function prepareCheckoutSafety(programmeIds: number[]): Promise<CheckoutSafetyPreparation> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured.");

  const [safetyConfig, regionsRes, acknowledgementRes] = await Promise.all([
    fetchSafetyConfig(),
    client.from("programme_body_regions").select("body_region_key").in("programme_id", programmeIds),
    client
      .from("safety_acknowledgement_versions")
      .select("version,title,body,checkbox_label")
      .eq("is_active", true)
      .limit(1),
  ]);

  if (regionsRes.error) throw new Error(regionsRes.error.message);
  if (acknowledgementRes.error) throw new Error(acknowledgementRes.error.message);
  const acknowledgement = acknowledgementRes.data?.[0];
  if (!acknowledgement) throw new Error("No active safety acknowledgement.");

  const regions = [...new Set((regionsRes.data ?? []).map((row) => String(row.body_region_key)))];
  const questions = getApplicableSafetyQuestions(safetyConfig, regions);

  return {
    questions,
    acknowledgement: {
      version: String(acknowledgement.version),
      title: acknowledgement.title as LocalizedText,
      body: acknowledgement.body as LocalizedText,
      checkboxLabel: acknowledgement.checkbox_label as LocalizedText,
    },
  };
}
