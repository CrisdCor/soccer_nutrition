"use client";

import { useMemo, useState } from "react";
import { NutritionPlanReport } from "@/components/nutricion/nutrition-plan-report";
import { NutritionPlanSheet } from "@/components/nutricion/nutrition-plan-sheet";
import { FilterSelect } from "@/components/ui/filter-select";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import { useUserProfile } from "@/lib/auth/user-profile-context";
import type { DiagnosisThresholds } from "@/lib/configuracion/queries";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";

type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };
type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };

/**
 * Pestaña "Plan Nutricional": reemplaza al viejo tab "Reporte" (que
 * mezclaba encabezado tipo informe + detalle de la valoración + plan). Acá
 * solo vive el plan -- el detalle de la valoración quedó en el panel
 * "Ver detalle" de cada fila de la tabla de "Valoraciones". Selector de
 * valoración, con la más reciente que YA tenga plan como default (si
 * ninguna tiene plan, cae en estado vacío con "Crear plan" para la última
 * valoración registrada).
 */
export function PlayerNutritionPlanTab({
  playerId,
  playerSex,
  playerBirthDate,
  assessments,
  thresholds,
  nutritionPlansByAssessment,
  dietTypes,
  foodGroups,
  mealTypes,
}: {
  playerId: string;
  playerSex: "Hombre" | "Mujer";
  playerBirthDate: string;
  /** Más reciente primero. */
  assessments: Assessment[];
  thresholds: DiagnosisThresholds;
  nutritionPlansByAssessment: Record<string, NutritionPlanFull>;
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
}) {
  const { role } = useUserProfile();
  const isLider = role === "lider";
  const defaultId = useMemo(
    () => assessments.find((a) => nutritionPlansByAssessment[a.id])?.id ?? assessments[0]?.id ?? "",
    [assessments, nutritionPlansByAssessment]
  );
  const [selectedId, setSelectedId] = useState(defaultId);
  const [sheetOpen, setSheetOpen] = useState(false);

  const assessment = assessments.find((a) => a.id === selectedId) ?? assessments[0];

  if (!assessment) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
        Este jugador todavía no tiene valoraciones registradas. Registra una valoración primero para poder crear un
        plan de alimentación.
      </div>
    );
  }

  const existingPlan = nutritionPlansByAssessment[assessment.id] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterSelect
          aria-label="Filtrar por valoración"
          value={assessment.id}
          onValueChange={setSelectedId}
          options={assessments.map((a) => ({
            value: a.id,
            label: `${a.assessment_date} · ${a.label}${nutritionPlansByAssessment[a.id] ? "" : " (sin plan)"}`,
          }))}
        />

        {!isLider && (
          <button type="button" onClick={() => setSheetOpen(true)} className="btn-secondary">
            {existingPlan ? "Editar plan" : "Crear plan"}
          </button>
        )}
      </div>

      {existingPlan ? (
        <NutritionPlanReport plan={existingPlan} dietTypes={dietTypes} foodGroups={foodGroups} mealTypes={mealTypes} />
      ) : (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            La valoración {assessment.label} · {assessment.assessment_date} todavía no tiene plan de alimentación.
          </p>
          {!isLider && (
            <button type="button" onClick={() => setSheetOpen(true)} className="btn-primary mt-4">
              Crear plan
            </button>
          )}
        </div>
      )}

      {!isLider && (
        <NutritionPlanSheet
          playerId={playerId}
          playerSex={playerSex}
          playerBirthDate={playerBirthDate}
          assessment={assessment}
          existingPlan={existingPlan}
          thresholds={thresholds}
          dietTypes={dietTypes}
          foodGroups={foodGroups}
          mealTypes={mealTypes}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </div>
  );
}
