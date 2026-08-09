import { createClient } from "@/lib/supabase/server";

const ASSESSMENT_COLUMNS = `
  id, assessment_date, label, weight_kg, height_cm, sitting_height_cm, wingspan_cm,
  skinfold_triceps, skinfold_subscapular, skinfold_biceps, skinfold_iliac_crest,
  skinfold_supraspinal, skinfold_abdominal, skinfold_thigh, skinfold_calf,
  girth_relaxed_arm, girth_flexed_arm, girth_waist, girth_hip, girth_thigh, girth_calf,
  diameter_humerus, diameter_bistyloid, diameter_femur,
  skinfold_sum_6, corrected_arm_girth, corrected_thigh_girth, corrected_calf_girth,
  bone_mass_kg, muscle_mass_kg, fat_percentage, fat_mass_kg, fat_free_mass_kg,
  adipose_mass_kg, residual_mass_kg, muscle_percentage, bone_percentage,
  adipose_percentage, residual_percentage, bmi, aks_index,
  created_at, updated_at, player_id
`;

/**
 * Todas las valoraciones del jugador, con el detalle completo -- se piden
 * una sola vez por carga de perfil y de ahí salen tanto la tabla como los
 * paneles laterales (detalle, formulario de edición, plan nutricional), sin
 * pedir de nuevo al servidor al abrir cada uno. No hay vista global de
 * valoraciones de todos los jugadores (se retiró del sidebar): todo se
 * consulta desde el perfil de cada jugador.
 */
export async function listAssessmentsByPlayer(playerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assessments")
    .select(ASSESSMENT_COLUMNS)
    .eq("player_id", playerId)
    .order("assessment_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
