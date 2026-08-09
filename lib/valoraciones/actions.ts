"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireProfile } from "@/lib/auth/session";
import { computeAssessmentIndicators, type RawMeasurements } from "@/lib/calculations";
import { getPlayerById } from "@/lib/jugadores/queries";
import { assessmentFormSchema, parseOptionalNumber, type AssessmentFormValues } from "@/lib/validation/assessment";

function buildRawMeasurements(parsed: AssessmentFormValues): RawMeasurements {
  return {
    weightKg: parseOptionalNumber(parsed.weight_kg),
    heightCm: parseOptionalNumber(parsed.height_cm),
    skinfoldTriceps: parseOptionalNumber(parsed.skinfold_triceps),
    skinfoldSubscapular: parseOptionalNumber(parsed.skinfold_subscapular),
    skinfoldSupraspinal: parseOptionalNumber(parsed.skinfold_supraspinal),
    skinfoldAbdominal: parseOptionalNumber(parsed.skinfold_abdominal),
    skinfoldThigh: parseOptionalNumber(parsed.skinfold_thigh),
    skinfoldCalf: parseOptionalNumber(parsed.skinfold_calf),
    girthRelaxedArm: parseOptionalNumber(parsed.girth_relaxed_arm),
    girthThigh: parseOptionalNumber(parsed.girth_thigh),
    girthCalf: parseOptionalNumber(parsed.girth_calf),
    diameterBistyloid: parseOptionalNumber(parsed.diameter_bistyloid),
    diameterFemur: parseOptionalNumber(parsed.diameter_femur),
  };
}

/**
 * Valoraciones son insert-only para nutricionista (y admin). La política RLS
 * de INSERT no distingue rol, así que ambos pueden crear.
 */
export async function createAssessment(playerId: string, values: AssessmentFormValues) {
  const parsed = assessmentFormSchema.parse(values);
  const { supabase, profile } = await requireProfile();

  const player = await getPlayerById(playerId);
  if (!player) {
    return { error: "Jugador no encontrado." };
  }

  const raw = buildRawMeasurements(parsed);
  if (raw.weightKg == null || raw.heightCm == null) {
    return { error: "Peso y talla deben ser números válidos." };
  }

  const assessmentDate = new Date(parsed.assessment_date);

  const indicators = computeAssessmentIndicators(
    raw,
    {
      sex: player.sex,
      birthDate: new Date(player.birth_date),
      raceMuscleConstant: player.race?.muscle_mass_constant ?? 0,
    },
    assessmentDate
  );

  const { error } = await supabase.from("assessments").insert({
    organization_id: profile.organization_id,
    player_id: playerId,
    created_by: profile.id,
    assessment_date: parsed.assessment_date,
    label: parsed.label,
    weight_kg: raw.weightKg,
    height_cm: raw.heightCm,
    sitting_height_cm: parseOptionalNumber(parsed.sitting_height_cm),
    wingspan_cm: parseOptionalNumber(parsed.wingspan_cm),
    skinfold_triceps: raw.skinfoldTriceps,
    skinfold_subscapular: raw.skinfoldSubscapular,
    skinfold_biceps: parseOptionalNumber(parsed.skinfold_biceps),
    skinfold_iliac_crest: parseOptionalNumber(parsed.skinfold_iliac_crest),
    skinfold_supraspinal: raw.skinfoldSupraspinal,
    skinfold_abdominal: raw.skinfoldAbdominal,
    skinfold_thigh: raw.skinfoldThigh,
    skinfold_calf: raw.skinfoldCalf,
    girth_relaxed_arm: raw.girthRelaxedArm,
    girth_flexed_arm: parseOptionalNumber(parsed.girth_flexed_arm),
    girth_waist: parseOptionalNumber(parsed.girth_waist),
    girth_hip: parseOptionalNumber(parsed.girth_hip),
    girth_thigh: raw.girthThigh,
    girth_calf: raw.girthCalf,
    diameter_humerus: parseOptionalNumber(parsed.diameter_humerus),
    diameter_bistyloid: raw.diameterBistyloid,
    diameter_femur: raw.diameterFemur,
    skinfold_sum_6: indicators.skinfoldSum6,
    corrected_arm_girth: indicators.correctedArmGirth,
    corrected_thigh_girth: indicators.correctedThighGirth,
    corrected_calf_girth: indicators.correctedCalfGirth,
    bone_mass_kg: indicators.boneMassKg,
    muscle_mass_kg: indicators.muscleMassKg,
    fat_percentage: indicators.fatPercentage,
    fat_mass_kg: indicators.fatMassKg,
    fat_free_mass_kg: indicators.fatFreeMassKg,
    adipose_mass_kg: indicators.adiposeMassKg,
    residual_mass_kg: indicators.residualMassKg,
    muscle_percentage: indicators.musclePercentage,
    bone_percentage: indicators.bonePercentage,
    adipose_percentage: indicators.adiposePercentage,
    residual_percentage: indicators.residualPercentage,
    bmi: indicators.bmi,
    aks_index: indicators.aksIndex,
  });

  if (error) {
    return { error: error.message };
  }

  // Ya no hay pantalla standalone a la que navegar: la valoración se crea
  // desde un panel lateral en el perfil del jugador, que se cierra solo y
  // refresca la tabla con router.refresh() del lado del cliente.
  revalidatePath(`/jugadores/${playerId}`);
  return {};
}

/**
 * Solo admin puede editar una valoración ya guardada (política RLS de
 * UPDATE). Se recalculan todos los indicadores derivados con los datos
 * (posiblemente corregidos) del formulario.
 */
export async function updateAssessment(assessmentId: string, values: AssessmentFormValues) {
  const parsed = assessmentFormSchema.parse(values);
  const { supabase, profile } = await requireAdmin();

  const { data: existing, error: fetchError } = await supabase
    .from("assessments")
    .select("player_id")
    .eq("id", assessmentId)
    .single();

  if (fetchError || !existing) {
    return { error: "Valoración no encontrada." };
  }

  const player = await getPlayerById(existing.player_id);
  if (!player) {
    return { error: "Jugador no encontrado." };
  }

  const raw = buildRawMeasurements(parsed);
  if (raw.weightKg == null || raw.heightCm == null) {
    return { error: "Peso y talla deben ser números válidos." };
  }

  const assessmentDate = new Date(parsed.assessment_date);

  const indicators = computeAssessmentIndicators(
    raw,
    {
      sex: player.sex,
      birthDate: new Date(player.birth_date),
      raceMuscleConstant: player.race?.muscle_mass_constant ?? 0,
    },
    assessmentDate
  );

  const { error } = await supabase
    .from("assessments")
    .update({
      assessment_date: parsed.assessment_date,
      label: parsed.label,
      weight_kg: raw.weightKg,
      height_cm: raw.heightCm,
      sitting_height_cm: parseOptionalNumber(parsed.sitting_height_cm),
      wingspan_cm: parseOptionalNumber(parsed.wingspan_cm),
      skinfold_triceps: raw.skinfoldTriceps,
      skinfold_subscapular: raw.skinfoldSubscapular,
      skinfold_biceps: parseOptionalNumber(parsed.skinfold_biceps),
      skinfold_iliac_crest: parseOptionalNumber(parsed.skinfold_iliac_crest),
      skinfold_supraspinal: raw.skinfoldSupraspinal,
      skinfold_abdominal: raw.skinfoldAbdominal,
      skinfold_thigh: raw.skinfoldThigh,
      skinfold_calf: raw.skinfoldCalf,
      girth_relaxed_arm: raw.girthRelaxedArm,
      girth_flexed_arm: parseOptionalNumber(parsed.girth_flexed_arm),
      girth_waist: parseOptionalNumber(parsed.girth_waist),
      girth_hip: parseOptionalNumber(parsed.girth_hip),
      girth_thigh: raw.girthThigh,
      girth_calf: raw.girthCalf,
      diameter_humerus: parseOptionalNumber(parsed.diameter_humerus),
      diameter_bistyloid: raw.diameterBistyloid,
      diameter_femur: raw.diameterFemur,
      skinfold_sum_6: indicators.skinfoldSum6,
      corrected_arm_girth: indicators.correctedArmGirth,
      corrected_thigh_girth: indicators.correctedThighGirth,
      corrected_calf_girth: indicators.correctedCalfGirth,
      bone_mass_kg: indicators.boneMassKg,
      muscle_mass_kg: indicators.muscleMassKg,
      fat_percentage: indicators.fatPercentage,
      fat_mass_kg: indicators.fatMassKg,
      fat_free_mass_kg: indicators.fatFreeMassKg,
      adipose_mass_kg: indicators.adiposeMassKg,
      residual_mass_kg: indicators.residualMassKg,
      muscle_percentage: indicators.musclePercentage,
      bone_percentage: indicators.bonePercentage,
      adipose_percentage: indicators.adiposePercentage,
      residual_percentage: indicators.residualPercentage,
      bmi: indicators.bmi,
      aks_index: indicators.aksIndex,
      updated_by: profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/jugadores/${existing.player_id}`);
  return {};
}
