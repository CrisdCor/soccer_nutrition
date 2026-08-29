import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
// Import de solo-tipo (se borra en build): reutiliza el mismo contrato de
// campos que ya usan las páginas de jugador en pantalla, en vez de
// duplicar los ~30 campos de una valoración acá.
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";

const PLAYER_PHOTOS_BUCKET = "player-photos";

// Mismas columnas que ASSESSMENT_COLUMNS en lib/valoraciones/queries.ts: el
// PDF necesita el detalle completo (para la tabla de mediciones de cada
// página individual), no el subset liviano de lib/dashboard/report-queries.ts.
const ASSESSMENT_COLUMNS = `
  id, assessment_date, label, weight_kg, height_cm, sitting_height_cm, wingspan_cm,
  skinfold_triceps, skinfold_subscapular, skinfold_biceps, skinfold_iliac_crest,
  skinfold_supraspinal, skinfold_abdominal, skinfold_thigh, skinfold_calf,
  girth_relaxed_arm, girth_flexed_arm, girth_waist, girth_hip, girth_thigh, girth_calf,
  diameter_humerus, diameter_bistyloid, diameter_femur,
  skinfold_sum_6, corrected_arm_girth, corrected_thigh_girth, corrected_calf_girth,
  bone_mass_kg, muscle_mass_kg, fat_percentage, fat_mass_kg, fat_free_mass_kg,
  adipose_mass_kg, residual_mass_kg, muscle_percentage, bone_percentage,
  adipose_percentage, residual_percentage, bmi, aks_index, player_id
`;

export type ReportAssessment = AssessmentDetailFields & {
  id: string;
  assessment_date: string;
  label: string;
  player_id: string;
};

export type ReportGroupPlayer = {
  id: string;
  full_name: string;
  sex: "Hombre" | "Mujer";
  birth_date: string;
  photo_path: string | null;
  position: { name: string } | null;
};

export type ReportPlayerAssessmentPair = {
  player: ReportGroupPlayer;
  assessment: ReportAssessment;
};

/**
 * Jugadores activos de la categoría + su valoración con la etiqueta (label)
 * elegida -- uno por jugador (la más reciente si por algún motivo hay más de
 * una con la misma etiqueta). Un jugador sin ninguna valoración con esa
 * etiqueta simplemente no aparece en el reporte (igual criterio que
 * selectPlayerAssessments() del dashboard).
 */
export async function getCategoryReportPlayers(
  categoryId: string,
  valoracionLabel: string
): Promise<ReportPlayerAssessmentPair[]> {
  const supabase = await createClient();

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, full_name, sex, birth_date, photo_path, position:positions(name)")
    .eq("status", "active")
    .eq("category_id", categoryId)
    .order("full_name");

  if (playersError) throw playersError;
  if (!players || players.length === 0) return [];

  const playerIds = players.map((p) => p.id);

  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select(ASSESSMENT_COLUMNS)
    .in("player_id", playerIds)
    .eq("label", valoracionLabel)
    .order("assessment_date", { ascending: false });

  if (assessmentsError) throw assessmentsError;

  const latestByPlayer = new Map<string, ReportAssessment>();
  for (const assessment of assessments ?? []) {
    if (!latestByPlayer.has(assessment.player_id)) {
      latestByPlayer.set(assessment.player_id, assessment);
    }
  }

  const result: ReportPlayerAssessmentPair[] = [];
  for (const player of players) {
    const assessment = latestByPlayer.get(player.id);
    if (!assessment) continue;
    result.push({ player, assessment });
  }
  return result;
}

/**
 * Igual que getCategoryReportPlayers(), pero para UN jugador puntual --
 * modo Individual del reporte. null si el jugador no existe/no está
 * activo, o si no tiene ninguna valoración con esa etiqueta (mismo
 * criterio: la más reciente si hay más de una).
 */
export async function getPlayerReportAssessment(
  playerId: string,
  valoracionLabel: string
): Promise<ReportPlayerAssessmentPair | null> {
  const supabase = await createClient();

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, full_name, sex, birth_date, photo_path, position:positions(name)")
    .eq("id", playerId)
    .eq("status", "active")
    .maybeSingle();

  if (playerError) throw playerError;
  if (!player) return null;

  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select(ASSESSMENT_COLUMNS)
    .eq("player_id", playerId)
    .eq("label", valoracionLabel)
    .order("assessment_date", { ascending: false })
    .limit(1);

  if (assessmentsError) throw assessmentsError;

  const assessment = assessments?.[0];
  if (!assessment) return null;

  return { player, assessment };
}

/**
 * Nunca se usa la URL firmada acá (a diferencia de getPlayerPhotoUrl en
 * lib/jugadores/queries.ts): @react-pdf/renderer renderiza en el mismo
 * proceso serverless que arma la respuesta, así que evitamos un round-trip
 * HTTP intermedio a Supabase Storage y descargamos el archivo directo,
 * embebido como data URI en el documento.
 *
 * @react-pdf/renderer solo decodifica PNG/JPEG/SVG (no WEBP) -- las fotos
 * subidas pueden ser JPEG/PNG/WEBP (ver ALLOWED_PHOTO_TYPES en
 * lib/jugadores/actions.ts), así que siempre se normalizan a PNG con sharp
 * antes de embeber, sin depender de la extensión del archivo.
 */
export async function getPlayerPhotoDataUri(photoPath: string | null): Promise<string | null> {
  if (!photoPath) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(PLAYER_PHOTOS_BUCKET).download(photoPath);
  if (error || !data) return null;

  const buffer = Buffer.from(await data.arrayBuffer());
  const pngBuffer = await sharp(buffer).png().toBuffer();
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}
