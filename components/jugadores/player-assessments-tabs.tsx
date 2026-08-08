"use client";

import Link from "next/link";
import * as Tabs from "@/components/ui/tabs";
import { AssessmentEvolutionChart } from "@/components/jugadores/assessment-evolution-chart";
import { PlayerAssessmentsTable } from "@/components/jugadores/player-assessments-table";
import { PlayerReportTab } from "@/components/jugadores/player-report-tab";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import type { ThresholdRange } from "@/lib/format";

type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };

export function PlayerAssessmentsTabs({
  playerId,
  playerName,
  playerDocument,
  photoUrl,
  assessments,
  thresholds,
}: {
  playerId: string;
  playerName: string;
  playerDocument: string;
  photoUrl: string | null;
  /** Ascendente por fecha (para el gráfico de evolución). */
  assessments: Assessment[];
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
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
          playerName={playerName}
          playerDocument={playerDocument}
          photoUrl={photoUrl}
          assessments={[...assessments].reverse()}
          thresholds={thresholds}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
