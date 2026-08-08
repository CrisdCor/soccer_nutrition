"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { parseOptionalNumber } from "@/lib/validation/assessment";
import { nutritionPlanPayloadSchema, type NutritionPlanPayload } from "@/lib/validation/nutrition-plan";

/**
 * nutrition_plans NO es insert-only como assessments: es un documento
 * clínico vivo, editable libremente por nutricionista y admin (política RLS
 * sin restricción de rol). Esta acción crea el plan si no existe uno para la
 * valoración (assessment_id es único), o lo actualiza si ya existe.
 */
export async function saveNutritionPlan(
  assessmentId: string,
  playerId: string,
  values: NutritionPlanPayload
): Promise<{ error?: string }> {
  const parsed = nutritionPlanPayloadSchema.parse(values);
  const { supabase, profile } = await requireProfile();

  const magnitude = parseOptionalNumber(parsed.caloric_adjustment_magnitude_kcal);
  const caloricAdjustmentKcal =
    magnitude == null
      ? null
      : parsed.caloric_adjustment_direction === "deficit"
        ? -Math.abs(magnitude)
        : Math.abs(magnitude);

  const planFields = {
    nutritional_diagnosis: parsed.nutritional_diagnosis.trim() || null,
    diet_type_observation: parsed.diet_type_observation.trim() || null,
    energy_requirement_kcal: parseOptionalNumber(parsed.energy_requirement_kcal),
    caloric_adjustment_kcal: caloricAdjustmentKcal,
    energy_distribution_kcal: parseOptionalNumber(parsed.energy_distribution_kcal),
    protein_g: parseOptionalNumber(parsed.protein_g),
    protein_g_per_kg: parseOptionalNumber(parsed.protein_g_per_kg),
    fat_g: parseOptionalNumber(parsed.fat_g),
    fat_g_per_kg: parseOptionalNumber(parsed.fat_g_per_kg),
    carbs_g: parseOptionalNumber(parsed.carbs_g),
    carbs_g_per_kg: parseOptionalNumber(parsed.carbs_g_per_kg),
    general_recommendations: parsed.general_recommendations.trim() || null,
  };

  const { data: existing, error: existingError } = await supabase
    .from("nutrition_plans")
    .select("id")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  let planId = existing?.id;

  if (planId) {
    const { error } = await supabase
      .from("nutrition_plans")
      .update({ ...planFields, updated_by: profile.id, updated_at: new Date().toISOString() })
      .eq("id", planId);

    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("nutrition_plans")
      .insert({
        organization_id: profile.organization_id,
        assessment_id: assessmentId,
        created_by: profile.id,
        ...planFields,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    planId = data.id;
  }

  // Tipos de dieta: se borra y se reinserta completo (junction simple, sin
  // necesidad de diff -- son pocos ítems por plan).
  const { error: deleteDietTypesError } = await supabase
    .from("nutrition_plan_diet_types")
    .delete()
    .eq("plan_id", planId);
  if (deleteDietTypesError) return { error: deleteDietTypesError.message };

  if (parsed.diet_type_ids.length > 0) {
    const { error } = await supabase
      .from("nutrition_plan_diet_types")
      .insert(parsed.diet_type_ids.map((diet_type_id) => ({ plan_id: planId, diet_type_id })));
    if (error) return { error: error.message };
  }

  // Porciones por grupo de alimento x comida.
  const portionRows = Object.entries(parsed.portions).map(([key, value]) => {
    const [foodGroupId, mealTypeIdRaw] = key.split(":");
    return {
      plan_id: planId,
      food_group_id: foodGroupId,
      meal_type_id: Number(mealTypeIdRaw),
      portions: parseOptionalNumber(value) ?? 0,
    };
  });

  if (portionRows.length > 0) {
    const { error } = await supabase
      .from("nutrition_plan_food_portions")
      .upsert(portionRows, { onConflict: "plan_id,food_group_id,meal_type_id" });
    if (error) return { error: error.message };
  }

  // Ejemplo de menú por comida.
  const menuRows = Object.entries(parsed.menu_examples).map(([mealTypeIdRaw, description]) => ({
    plan_id: planId,
    meal_type_id: Number(mealTypeIdRaw),
    description: description.trim() || null,
  }));

  if (menuRows.length > 0) {
    const { error } = await supabase
      .from("nutrition_plan_menu_examples")
      .upsert(menuRows, { onConflict: "plan_id,meal_type_id" });
    if (error) return { error: error.message };
  }

  revalidatePath(`/jugadores/${playerId}`);
  return {};
}
