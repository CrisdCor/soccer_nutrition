"use client";

import { useState } from "react";
import { NutritionPlanForm } from "@/components/nutricion/nutrition-plan-form";
import { NutritionPlanReport } from "@/components/nutricion/nutrition-plan-report";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";

type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };

export function NutritionPlanSection({
  assessmentId,
  playerId,
  dietTypes,
  foodGroups,
  mealTypes,
  existingPlan,
  suggestedDiagnosis,
}: {
  assessmentId: string;
  playerId: string;
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
  existingPlan: NutritionPlanFull | null;
  suggestedDiagnosis: string;
}) {
  // Arranca siempre colapsado: reporte (o placeholder) + botón "Crear plan"/
  // "Editar plan" -- nunca se entra al formulario sin que el usuario lo pida.
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          {existingPlan ? "Editar plan de alimentación" : "Nuevo plan de alimentación"}
        </h3>
        <NutritionPlanForm
          assessmentId={assessmentId}
          playerId={playerId}
          dietTypes={dietTypes}
          foodGroups={foodGroups}
          mealTypes={mealTypes}
          existingPlan={existingPlan}
          suggestedDiagnosis={suggestedDiagnosis}
          onSaved={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  if (!existingPlan) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Plan de alimentación</h3>
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center">
          <p className="text-sm text-muted">Esta valoración todavía no tiene plan de alimentación.</p>
          <button type="button" onClick={() => setIsEditing(true)} className="btn-primary mt-4">
            Crear plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Plan de alimentación</h3>
        <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary">
          Editar plan
        </button>
      </div>
      <NutritionPlanReport
        plan={existingPlan}
        dietTypes={dietTypes}
        foodGroups={foodGroups}
        mealTypes={mealTypes}
      />
    </div>
  );
}
