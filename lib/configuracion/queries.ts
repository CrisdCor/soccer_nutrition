import { createClient } from "@/lib/supabase/server";
import type { ThresholdRange } from "@/lib/format";

export async function listThresholds() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reference_thresholds")
    .select("id, metric, low_cut, high_cut, effective_from, created_at")
    .order("effective_from", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export type CurrentThresholds = Record<
  "skinfold_sum" | "aks_index" | "weight_change_pct" | "fat_percentage",
  ThresholdRange | null
>;

/**
 * Subconjunto de CurrentThresholds que necesita el diagnóstico sugerido de
 * un plan nutricional (lib/nutricion/diagnosis.ts) -- las pantallas/paneles
 * que terminan pasándole esto a buildSuggestedDiagnosis() (NutritionPlanSheet
 * y toda la cadena que la alimenta: PlayerAssessmentsTabs, AssessmentRowActions,
 * PlayerNutritionPlanTab, PlayerAssessmentsTable) usan este tipo en vez de
 * repetir el literal cada vez.
 */
export type DiagnosisThresholds = Pick<CurrentThresholds, "skinfold_sum" | "aks_index" | "fat_percentage">;

/** El umbral vigente por métrica: el más reciente con effective_from <= hoy. */
export async function getCurrentThresholds(): Promise<CurrentThresholds> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("reference_thresholds")
    .select("metric, low_cut, high_cut, effective_from")
    .lte("effective_from", today)
    .order("effective_from", { ascending: false });

  if (error) throw error;

  const result: CurrentThresholds = {
    skinfold_sum: null,
    aks_index: null,
    weight_change_pct: null,
    fat_percentage: null,
  };
  for (const row of data ?? []) {
    if (result[row.metric] === null) {
      result[row.metric] = { low_cut: row.low_cut, high_cut: row.high_cut };
    }
  }
  return result;
}

// diet_types / food_groups: a diferencia de positions/categories, su policy
// RLS ("ALL (organization_id = current_user_org())") NO exige role = 'admin'
// -- cualquier nutricionista/admin de la organización los administra.

export async function listDietTypes(options?: { activeOnly?: boolean }) {
  const supabase = await createClient();
  let query = supabase.from("diet_types").select("id, name, active").order("name");

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listFoodGroups(options?: { activeOnly?: boolean }) {
  const supabase = await createClient();
  let query = supabase.from("food_groups").select("id, name, active").order("name");

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
