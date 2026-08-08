"use client";

import Link from "next/link";
import * as Tabs from "@/components/ui/tabs";
import { AssessmentEvolutionChart } from "@/components/jugadores/assessment-evolution-chart";
import { PlayerAssessmentsTable } from "@/components/jugadores/player-assessments-table";
import { PlayerReportTab } from "@/components/jugadores/player-report-tab";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import type { ThresholdRange } from "@/lib/format";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";

type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };
type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };

export function PlayerAssessmentsTabs({
  playerId,
  playerName,
  playerDocument,
  playerSex,
  playerBirthDate,
  photoUrl,
  assessments,
  thresholds,
  nutritionPlansByAssessment,
  dietTypes,
  foodGroups,
  mealTypes,
}: {
  playerId: string;
  playerName: string;
  playerDocument: string;
  playerSex: "Hombre" | "Mujer";
  playerBirthDate: string;
  photoUrl: string | null;
  /** Ascendente por fecha (para el gráfico de evolución). */
  assessments: Assessment[];
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
  nutritionPlansByAssessment: Record<string, NutritionPlanFull>;
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
}) {
  const chartPoints = assessments.map((a) => ({
    date: a.assessment_date,
    weightKg: a.weight_kg,
    fatPercentage: a.fat_percentage != null ? a.fat_percentage * 100 : null,
  }));

  return (
    <Tabs.Root defaultValue="evolucion">
      <div className="flex items-center justify-between">
        <Tabs.List>
          <Tabs.Trigger value="evolucion">Evolución</Tabs.Trigger>
          <Tabs.Trigger value="reporte">Reporte</Tabs.Trigger>
        </Tabs.List>

        <Link href={`/jugadores/${playerId}/valoraciones/nueva`} className="btn-primary">
          Nueva valoración
        </Link>
      </div>

      <Tabs.Content value="evolucion" className="space-y-4 pt-4">
        <AssessmentEvolutionChart points={chartPoints} />
        <PlayerAssessmentsTable assessments={assessments} />
      </Tabs.Content>

      <Tabs.Content value="reporte" className="pt-4">
        <PlayerReportTab
          playerId={playerId}
          playerName={playerName}
          playerDocument={playerDocument}
          playerSex={playerSex}
          playerBirthDate={playerBirthDate}
          photoUrl={photoUrl}
          assessments={[...assessments].reverse()}
          thresholds={thresholds}
          nutritionPlansByAssessment={nutritionPlansByAssessment}
          dietTypes={dietTypes}
          foodGroups={foodGroups}
          mealTypes={mealTypes}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
