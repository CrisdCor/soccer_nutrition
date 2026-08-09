import { createClient } from "@/lib/supabase/server";

export type DashboardFilters = {
  categoryId?: string;
  sex?: "Hombre" | "Mujer";
};

export async function getDashboardStats(filters: DashboardFilters) {
  const supabase = await createClient();

  // Solo id: full_name/sex/category/position alimentaban la tabla de
  // jugadores que vivía debajo de las KPI cards, retirada del dashboard
  // general por quedar redundante con Tabla_Resumen (una de las 5
  // visualizaciones, que ya cumple ese rol de listado tabular).
  let playersQuery = supabase.from("players").select("id").eq("status", "active");

  if (filters.categoryId) {
    playersQuery = playersQuery.eq("category_id", filters.categoryId);
  }
  if (filters.sex) {
    playersQuery = playersQuery.eq("sex", filters.sex);
  }

  const { data: players, error: playersError } = await playersQuery;
  if (playersError) throw playersError;

  const playerIds = (players ?? []).map((player) => player.id);

  let assessmentsCount = 0;
  let outOfThresholdCount = 0;

  if (playerIds.length > 0) {
    const { data: assessments, error: assessmentsError } = await supabase
      .from("assessments")
      .select("player_id, aks_index, assessment_date")
      .in("player_id", playerIds)
      .order("assessment_date", { ascending: false });

    if (assessmentsError) throw assessmentsError;

    assessmentsCount = assessments?.length ?? 0;

    const { data: threshold } = await supabase
      .from("reference_thresholds")
      .select("low_cut, high_cut")
      .eq("metric", "aks_index")
      .lte("effective_from", new Date().toISOString().slice(0, 10))
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (threshold) {
      // Última valoración por jugador (assessments ya viene ordenado desc).
      const latestAksByPlayer = new Map<string, number | null>();
      for (const assessment of assessments ?? []) {
        if (!latestAksByPlayer.has(assessment.player_id)) {
          latestAksByPlayer.set(assessment.player_id, assessment.aks_index);
        }
      }

      for (const aks of latestAksByPlayer.values()) {
        if (aks != null && (aks < threshold.low_cut || aks > threshold.high_cut)) {
          outOfThresholdCount += 1;
        }
      }
    }
  }

  return {
    playersCount: players?.length ?? 0,
    assessmentsCount,
    outOfThresholdCount,
  };
}
