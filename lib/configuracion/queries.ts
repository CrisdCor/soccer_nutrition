import { createClient } from "@/lib/supabase/server";

export async function listThresholds() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reference_thresholds")
    .select("id, metric, low_cut, high_cut, effective_from, created_at")
    .order("effective_from", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
