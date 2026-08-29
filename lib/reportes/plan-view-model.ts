import type { NutritionPlanFull } from "@/lib/nutricion/queries";
import type { ReportCatalogs } from "@/lib/pdf/types";

/**
 * Helpers puros derivados de un NutritionPlanFull + catálogos -- extraídos
 * de PlanSections (lib/pdf/player-page.tsx) para que el renderer de Word
 * (lib/docx/player-section.ts) reutilice exactamente el mismo cálculo en
 * vez de duplicarlo; solo el layout de salida difiere entre PDF y Word.
 */

export function getDietTypeNames(plan: NutritionPlanFull, catalogs: ReportCatalogs): string[] {
  return plan.dietTypeIds
    .map((id) => catalogs.dietTypes.find((d) => d.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function getAdjustmentLabel(plan: NutritionPlanFull): string | null {
  if (plan.caloric_adjustment_kcal == null) return null;
  return plan.caloric_adjustment_kcal < 0
    ? `Déficit de ${Math.abs(plan.caloric_adjustment_kcal)} kcal`
    : `Superávit de ${plan.caloric_adjustment_kcal} kcal`;
}

export function getFoodGroupRowTotal(
  plan: NutritionPlanFull,
  catalogs: ReportCatalogs,
  foodGroupId: string
): number {
  return catalogs.mealTypes.reduce(
    (sum, mealType) => sum + (plan.portions[`${foodGroupId}:${mealType.id}`] ?? 0),
    0
  );
}
