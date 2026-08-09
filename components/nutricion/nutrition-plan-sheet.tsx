"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import * as Sheet from "@/components/ui/sheet";
import { NutritionPlanForm } from "@/components/nutricion/nutrition-plan-form";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import { buildSuggestedDiagnosis } from "@/lib/nutricion/diagnosis";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";
import type { ThresholdRange } from "@/lib/format";

type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };
type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };

/**
 * Crear/editar el plan de alimentación de UNA valoración puntual, en un
 * panel lateral -- reemplaza a NutritionPlanSection (que vivía embebida en
 * la extinta pestaña "Reporte"). Se usa tanto desde el botón "Crear
 * plan"/"Editar plan" del encabezado (valoración más reciente) como desde
 * el ítem "Ver/crear plan nutricional" del menú "•••" de cualquier fila
 * (valoración puntual, no necesariamente la última) -- por eso recibe la
 * valoración completa como prop en vez de asumir cuál es.
 *
 * Solo formulario: no hay una vista de solo-lectura separada acá (esa vive
 * en la pestaña "Plan Nutricional" del perfil). Completamente controlado
 * (open/onOpenChange), sin trigger propio -- mismo patrón que
 * AssessmentDetailSheet/AssessmentFormSheet.
 */
export function NutritionPlanSheet({
  playerId,
  playerSex,
  playerBirthDate,
  assessment,
  existingPlan,
  thresholds,
  dietTypes,
  foodGroups,
  mealTypes,
  open,
  onOpenChange,
}: {
  playerId: string;
  playerSex: "Hombre" | "Mujer";
  playerBirthDate: string;
  assessment: Assessment;
  existingPlan: NutritionPlanFull | null;
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const suggestedDiagnosis = useMemo(
    () =>
      buildSuggestedDiagnosis({
        sex: playerSex,
        birthDate: new Date(playerBirthDate),
        assessmentDate: new Date(assessment.assessment_date),
        weightKg: assessment.weight_kg,
        heightCm: assessment.height_cm,
        bmi: assessment.bmi,
        aksIndex: assessment.aks_index,
        skinfoldSum6: assessment.skinfold_sum_6,
        fatPercentage: assessment.fat_percentage,
        thresholds,
      }),
    [playerSex, playerBirthDate, assessment, thresholds]
  );

  function handleSaved() {
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content size="xl">
        <Sheet.Header>
          <Sheet.Title>{existingPlan ? "Editar plan de alimentación" : "Nuevo plan de alimentación"}</Sheet.Title>
          <Sheet.Description>
            {assessment.label} · {assessment.assessment_date}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body>
          <NutritionPlanForm
            key={assessment.id}
            assessmentId={assessment.id}
            playerId={playerId}
            weightKg={assessment.weight_kg}
            dietTypes={dietTypes}
            foodGroups={foodGroups}
            mealTypes={mealTypes}
            existingPlan={existingPlan}
            suggestedDiagnosis={suggestedDiagnosis}
            onSaved={handleSaved}
            onCancel={() => onOpenChange(false)}
          />
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  );
}
