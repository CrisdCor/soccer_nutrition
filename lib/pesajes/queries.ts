import { createClient } from "@/lib/supabase/server";

export type TodayWeighIn = {
  player_id: string;
  weight_kg: number;
  recorded_at: string;
};

// Bogotá (UTC-5, sin horario de verano) es la única zona horaria de la
// organización por ahora -- mismo criterio que "por ahora, la única
// organización" en otros comentarios del proyecto (ver lib/jugadores/actions.ts).
// Sin esto, "hoy" se calcularía en UTC y durante buena parte de la tarde/
// noche en Colombia (cuando de hecho se hacen los entrenos) ya sería
// "mañana" en UTC -- justo el peor momento para que el aviso "ya
// registrado hoy" falle.
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

function getTodayRangeBogota(): { startIso: string; endIso: string } {
  const bogotaNow = new Date(Date.now() - BOGOTA_OFFSET_MS);
  const y = bogotaNow.getUTCFullYear();
  const m = bogotaNow.getUTCMonth();
  const d = bogotaNow.getUTCDate();

  const startUtcMs = Date.UTC(y, m, d, 0, 0, 0) + BOGOTA_OFFSET_MS;
  const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000;

  return { startIso: new Date(startUtcMs).toISOString(), endIso: new Date(endUtcMs).toISOString() };
}

/**
 * Todos los pesajes de HOY (día calendario en Bogotá), de cualquier
 * jugador. Ascendente por fecha, para que el último de cada jugador en el
 * cliente sea "el más reciente" -- se usa solo como referencia no
 * bloqueante junto al input de cada jugador (ver spec: pesar más de una
 * vez el mismo día es válido, ej. entreno + partido).
 */
export async function listTodaysWeighIns(): Promise<TodayWeighIn[]> {
  const supabase = await createClient();
  const { startIso, endIso } = getTodayRangeBogota();

  const { data, error } = await supabase
    .from("daily_weigh_ins")
    .select("player_id, weight_kg, recorded_at")
    .gte("recorded_at", startIso)
    .lt("recorded_at", endIso)
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
