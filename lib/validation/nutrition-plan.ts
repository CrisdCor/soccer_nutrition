import { z } from "zod";

// A diferencia de los demás formularios del proyecto, este no usa
// react-hook-form: la tabla de porciones y los ejemplos de menú son
// completamente dinámicos (dependen de food_groups/meal_types, que son
// catálogos editables en runtime), lo que no encaja bien con un tipo de
// formulario estático. Se maneja como estado de componente + este schema
// para revalidar en servidor (defensa en profundidad), igual de estricto
// que en los demás módulos.
export const nutritionPlanPayloadSchema = z.object({
  nutritional_diagnosis: z.string(),
  diet_type_ids: z.array(z.string()),
  diet_type_observation: z.string(),
  energy_requirement_kcal: z.string(),
  caloric_adjustment_direction: z.enum(["deficit", "superavit", "mantenimiento"]),
  caloric_adjustment_magnitude_kcal: z.string(),
  energy_distribution_kcal: z.string(),
  protein_g: z.string(),
  protein_g_per_kg: z.string(),
  fat_g: z.string(),
  fat_g_per_kg: z.string(),
  carbs_g: z.string(),
  carbs_g_per_kg: z.string(),
  general_recommendations: z.string(),
  /** key: `${food_group_id}:${meal_type_id}` -> string numérico */
  portions: z.record(z.string(), z.string()),
  /** key: meal_type_id (como string) -> descripción */
  menu_examples: z.record(z.string(), z.string()),
});

export type NutritionPlanPayload = z.infer<typeof nutritionPlanPayloadSchema>;
