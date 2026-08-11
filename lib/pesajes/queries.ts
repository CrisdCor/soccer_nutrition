import { createClient } from "@/lib/supabase/server";
import { getDateRangeBogota } from "@/lib/pesajes/timezone";

export type WeighInRecord = {
  id: string;
  player_id: string;
  weight_kg: number;
  recorded_at: string;
};

/**
 * Todos los pesajes de una fecha puntual (día calendario en Bogotá) --
 * todos, no solo el último: un jugador puede tener más de uno (ej. entreno
 * + partido) y cada uno se muestra y se edita/borra por separado (por su
 * `id`), ver WeighInForm. Ascendente por fecha (orden cronológico al
 * mostrarlos). `dateStr` en formato "YYYY-MM-DD"; el caller (la página)
 * default a getTodayDateStringBogota() si no viene en la URL.
 */
export async function listWeighInsForDate(dateStr: string): Promise<WeighInRecord[]> {
  const supabase = await createClient();
  const { startIso, endIso } = getDateRangeBogota(dateStr);

  const { data, error } = await supabase
    .from("daily_weigh_ins")
    .select("id, player_id, weight_kg, recorded_at")
    .gte("recorded_at", startIso)
    .lt("recorded_at", endIso)
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
