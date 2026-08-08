import { createClient } from "@/lib/supabase/server";

export async function listMealTypes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_types")
    .select("id, name, sort_order")
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export type NutritionPlanFull = {
  id: string;
  assessment_id: string;
  nutritional_diagnosis: string | null;
  diet_type_observation: string | null;
  energy_requirement_kcal: number | null;
  caloric_adjustment_kcal: number | null;
  energy_distribution_kcal: number | null;
  protein_g: number | null;
  protein_g_per_kg: number | null;
  fat_g: number | null;
  fat_g_per_kg: number | null;
  carbs_g: number | null;
  carbs_g_per_kg: number | null;
  general_recommendations: string | null;
  dietTypeIds: string[];
  /** key: `${food_group_id}:${meal_type_id}` */
  portions: Record<string, number>;
  /** key: meal_type_id */
  menuExamples: Record<number, string>;
};

/**
 * Un plan de alimentación por valoración (assessment_id es único en
 * nutrition_plans). Se traen TODOS los planes de las valoraciones del
 * jugador de una vez -- son pocas por jugador, igual que ya hacemos con las
 * valoraciones mismas -- para que el tab "Reporte" (client component) no
 * tenga que pedir datos al servidor al cambiar de valoración seleccionada.
 */
export async function getNutritionPlansByPlayer(
  playerId: string
): Promise<Record<string, NutritionPlanFull>> {
  const supabase = await createClient();

  const { data: assessmentRows, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id")
    .eq("player_id", playerId);

  if (assessmentsError) throw assessmentsError;

  const assessmentIds = (assessmentRows ?? []).map((row) => row.id);
  if (assessmentIds.length === 0) return {};

  const { data: plans, error } = await supabase
    .from("nutrition_plans")
    .select(
      `id, assessment_id, nutritional_diagnosis, diet_type_observation,
       energy_requirement_kcal, caloric_adjustment_kcal, energy_distribution_kcal,
       protein_g, protein_g_per_kg, fat_g, fat_g_per_kg, carbs_g, carbs_g_per_kg,
       general_recommendations,
       diet_types:nutrition_plan_diet_types(diet_type_id),
       portions:nutrition_plan_food_portions(food_group_id, meal_type_id, portions),
       menu_examples:nutrition_plan_menu_examples(meal_type_id, description)`
    )
    .in("assessment_id", assessmentIds);

  if (error) throw error;

  const result: Record<string, NutritionPlanFull> = {};
  for (const plan of plans ?? []) {
    result[plan.assessment_id] = {
      id: plan.id,
      assessment_id: plan.assessment_id,
      nutritional_diagnosis: plan.nutritional_diagnosis,
      diet_type_observation: plan.diet_type_observation,
      energy_requirement_kcal: plan.energy_requirement_kcal,
      caloric_adjustment_kcal: plan.caloric_adjustment_kcal,
      energy_distribution_kcal: plan.energy_distribution_kcal,
      protein_g: plan.protein_g,
      protein_g_per_kg: plan.protein_g_per_kg,
      fat_g: plan.fat_g,
      fat_g_per_kg: plan.fat_g_per_kg,
      carbs_g: plan.carbs_g,
      carbs_g_per_kg: plan.carbs_g_per_kg,
      general_recommendations: plan.general_recommendations,
      dietTypeIds: (plan.diet_types ?? []).map((row) => row.diet_type_id),
      portions: Object.fromEntries(
        (plan.portions ?? []).map((row) => [`${row.food_group_id}:${row.meal_type_id}`, row.portions])
      ),
      menuExamples: Object.fromEntries(
        (plan.menu_examples ?? []).map((row) => [row.meal_type_id, row.description ?? ""])
      ),
    };
  }
  return result;
}
