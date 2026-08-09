"use client";

import { useState } from "react";
import { AssessmentDetailSheet } from "@/components/valoraciones/assessment-detail-sheet";
import { AssessmentRowActions } from "@/components/valoraciones/assessment-row-actions";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import { formatIndicator, formatPercentage } from "@/lib/format";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";
import type { ThresholdRange } from "@/lib/format";

type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };
type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };

export function PlayerAssessmentsTable({
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
  assessments: Assessment[];
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
  nutritionPlansByAssessment: Record<string, NutritionPlanFull>;
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
}) {
  if (assessments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-6 text-center text-sm text-muted">
        Este jugador todavía no tiene valoraciones registradas.
      </div>
    );
  }

  // Más reciente primero para la tabla (las queries traen ascendente).
  const rows = [...assessments].reverse();

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted">
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Etiqueta</th>
            <th className="px-4 py-3 font-medium">Peso</th>
            <th className="px-4 py-3 font-medium">% Grasa</th>
            <th className="px-4 py-3 font-medium">AKS</th>
            <th className="px-4 py-3 font-medium" aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {rows.map((assessment) => (
            <tr key={assessment.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <AssessmentDateCell assessment={assessment} />
              </td>
              <td className="px-4 py-3 text-muted">{assessment.label}</td>
              <td className="data px-4 py-3 text-muted">{formatIndicator(assessment.weight_kg, 1, " kg")}</td>
              <td className="data px-4 py-3 text-muted">{formatPercentage(assessment.fat_percentage)}</td>
              <td className="data px-4 py-3 text-muted">{formatIndicator(assessment.aks_index, 2)}</td>
              <td className="px-4 py-3 text-right">
                <AssessmentRowActions
                  assessment={assessment}
                  playerId={playerId}
                  playerSex={playerSex}
                  playerBirthDate={playerBirthDate}
                  existingPlan={nutritionPlansByAssessment[assessment.id] ?? null}
                  thresholds={thresholds}
                  dietTypes={dietTypes}
                  foodGroups={foodGroups}
                  mealTypes={mealTypes}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * La fecha abre el mismo panel de detalle que el ítem "Ver detalle" del
 * menú "•••" -- ambos disparadores para la misma acción, con su propio
 * estado open/onOpenChange (no comparten uno con el menú de la fila).
 */
function AssessmentDateCell({ assessment }: { assessment: Assessment }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="data font-medium text-foreground hover:underline"
      >
        {assessment.assessment_date}
      </button>
      <AssessmentDetailSheet assessment={assessment} open={open} onOpenChange={setOpen} />
    </>
  );
}
