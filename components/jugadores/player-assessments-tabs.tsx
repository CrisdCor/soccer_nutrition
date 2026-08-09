"use client";

import { useState } from "react";
import * as Tabs from "@/components/ui/tabs";
import { PlayerAssessmentsTable } from "@/components/jugadores/player-assessments-table";
import { PlayerNutritionPlanTab } from "@/components/jugadores/player-nutrition-plan-tab";
import { AssessmentFormSheet } from "@/components/valoraciones/assessment-form-sheet";
import { NutritionPlanSheet } from "@/components/nutricion/nutrition-plan-sheet";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import { useUserProfile } from "@/lib/auth/user-profile-context";
import type { ThresholdRange } from "@/lib/format";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";

type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };
type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };

/**
 * Dos pestañas del perfil de jugador:
 *  - "Valoraciones": solo la tabla comparativa (el gráfico de evolución se
 *    retiró de acá).
 *  - "Plan Nutricional": lectura + selector de valoración, ver
 *    PlayerNutritionPlanTab.
 * Ambas acciones del encabezado ("Nueva valoración" y "Crear
 * plan"/"Editar plan") abren paneles laterales en vez de navegar a
 * pantallas separadas -- ya no hay rutas standalone de valoraciones.
 */
export function PlayerAssessmentsTabs({
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
  /** Ascendente por fecha. */
  assessments: Assessment[];
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
  nutritionPlansByAssessment: Record<string, NutritionPlanFull>;
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
}) {
  const { role } = useUserProfile();
  const isLider = role === "lider";
  const [newAssessmentOpen, setNewAssessmentOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const latestAssessment = assessments.at(-1) ?? null;
  const latestHasPlan = latestAssessment ? Boolean(nutritionPlansByAssessment[latestAssessment.id]) : false;

  return (
    <Tabs.Root defaultValue="valoraciones">
      <div className="flex items-center justify-between">
        <Tabs.List>
          <Tabs.Trigger value="valoraciones">Valoraciones</Tabs.Trigger>
          <Tabs.Trigger value="plan-nutricional">Plan Nutricional</Tabs.Trigger>
        </Tabs.List>

        {!isLider && (
          <div className="flex gap-2">
            {latestAssessment ? (
              <button type="button" onClick={() => setPlanOpen(true)} className="btn-secondary">
                {latestHasPlan ? "Editar plan" : "Crear plan"}
              </button>
            ) : (
              <button type="button" disabled title="Registra una valoración primero" className="btn-secondary">
                Crear plan
              </button>
            )}
            <button type="button" onClick={() => setNewAssessmentOpen(true)} className="btn-primary">
              Nueva valoración
            </button>
          </div>
        )}
      </div>

      <Tabs.Content value="valoraciones" className="pt-4">
        <PlayerAssessmentsTable
          playerId={playerId}
          playerSex={playerSex}
          playerBirthDate={playerBirthDate}
          assessments={assessments}
          thresholds={thresholds}
          nutritionPlansByAssessment={nutritionPlansByAssessment}
          dietTypes={dietTypes}
          foodGroups={foodGroups}
          mealTypes={mealTypes}
        />
      </Tabs.Content>

      <Tabs.Content value="plan-nutricional" className="pt-4">
        <PlayerNutritionPlanTab
          playerId={playerId}
          playerSex={playerSex}
          playerBirthDate={playerBirthDate}
          assessments={[...assessments].reverse()}
          thresholds={thresholds}
          nutritionPlansByAssessment={nutritionPlansByAssessment}
          dietTypes={dietTypes}
          foodGroups={foodGroups}
          mealTypes={mealTypes}
        />
      </Tabs.Content>

      <AssessmentFormSheet mode="create" playerId={playerId} open={newAssessmentOpen} onOpenChange={setNewAssessmentOpen} />

      {latestAssessment && (
        <NutritionPlanSheet
          playerId={playerId}
          playerSex={playerSex}
          playerBirthDate={playerBirthDate}
          assessment={latestAssessment}
          existingPlan={nutritionPlansByAssessment[latestAssessment.id] ?? null}
          thresholds={thresholds}
          dietTypes={dietTypes}
          foodGroups={foodGroups}
          mealTypes={mealTypes}
          open={planOpen}
          onOpenChange={setPlanOpen}
        />
      )}
    </Tabs.Root>
  );
}
