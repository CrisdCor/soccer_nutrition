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

export type CurrentThresholds = Record<"skinfold_sum" | "aks_index", ThresholdRange | null>;

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

  const result: CurrentThresholds = { skinfold_sum: null, aks_index: null };
  for (const row of data ?? []) {
    if (result[row.metric] === null) {
      result[row.metric] = { low_cut: row.low_cut, high_cut: row.high_cut };
    }
  }
  return result;
}
