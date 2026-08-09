import { createClient } from "@/lib/supabase/server";

export type ReportPlayer = {
  id: string;
  full_name: string;
  sex: "Hombre" | "Mujer";
  birth_date: string;
  category: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
};

export type ReportAssessment = {
  id: string;
  player_id: string;
  assessment_date: string;
  label: string;
  weight_kg: number;
  height_cm: number;
  fat_free_mass_kg: number | null;
  muscle_percentage: number | null;
  skinfold_sum_6: number | null;
  aks_index: number | null;
  skinfold_triceps: number | null;
  skinfold_subscapular: number | null;
  skinfold_supraspinal: number | null;
  skinfold_abdominal: number | null;
  skinfold_thigh: number | null;
  skinfold_calf: number | null;
  skinfold_biceps: number | null;
  skinfold_iliac_crest: number | null;
};

/**
 * Jugadores activos + TODAS sus valoraciones, en dos queries livianas (sin
 * filtrar por posición/categoría/valoración a nivel de servidor). Las 5
 * visualizaciones del dashboard filtran/agrupan esto en el cliente -- mismo
 * criterio que la búsqueda en vivo de /jugadores: el volumen de datos de un
 * plantel es chico y evita ir al servidor por cada combinación de filtros.
 */
export async function listReportPlayers(): Promise<ReportPlayer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("id, full_name, sex, birth_date, category:categories(id, name), position:positions(id, name)")
    .eq("status", "active")
    .order("full_name");

  if (error) throw error;
  return data ?? [];
}

const REPORT_ASSESSMENT_COLUMNS = `
  id, player_id, assessment_date, label, weight_kg, height_cm,
  fat_free_mass_kg, muscle_percentage, skinfold_sum_6, aks_index,
  skinfold_triceps, skinfold_subscapular, skinfold_supraspinal, skinfold_abdominal,
  skinfold_thigh, skinfold_calf, skinfold_biceps, skinfold_iliac_crest
`;

/**
 * Todas las valoraciones de todos los jugadores (no solo activos: se cruza
 * con listReportPlayers() en el cliente, así que las de jugadores inactivos
 * simplemente no encuentran dueño y se ignoran). Ascendente por fecha, para
 * que el último elemento de cada grupo por jugador sea "la más reciente".
 */
export async function listReportAssessments(): Promise<ReportAssessment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(REPORT_ASSESSMENT_COLUMNS)
    .order("assessment_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
