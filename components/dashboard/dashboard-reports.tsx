"use client";

import { useMemo } from "react";
import * as Segmented from "@/components/ui/segmented-control";
import { BodyWeightReport } from "@/components/dashboard/body-weight-report";
import { PlayerSummaryReport } from "@/components/dashboard/player-summary-report";
import { SingleMetricReport } from "@/components/dashboard/single-metric-report";
import { SummaryTableReport } from "@/components/dashboard/summary-table-report";
import { buildValoracionOptions, groupAssessmentsByPlayer } from "@/lib/dashboard/report-helpers";
import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";
import type { CurrentThresholds } from "@/lib/configuracion/queries";

type CatalogOption = { id: string; name: string };

/**
 * Las 5 visualizaciones del Excel original (Rep. Suma Pliegues, Rep. Peso
 * Corp. Mlg, Rep. IAKS, Tabla_Resumen, Resumen por Jugador), en un
 * contenedor de altura fija con navegación horizontal (segmented control)
 * en vez de scroll vertical de la página -- cambiar de vista no hace crecer
 * el layout general; cada vista maneja su propio scroll interno.
 *
 * Los datos (jugadores activos + todas sus valoraciones) se piden una sola
 * vez acá arriba y se agrupan por jugador; cada vista filtra/ordena/recorta
 * en el cliente a partir de ese mismo set, sin pedir de nuevo al servidor.
 */
export function DashboardReports({
  players,
  assessments,
  categories,
  positions,
  thresholds,
}: {
  players: ReportPlayer[];
  assessments: ReportAssessment[];
  categories: CatalogOption[];
  positions: CatalogOption[];
  thresholds: CurrentThresholds;
}) {
  const assessmentsByPlayer = useMemo(() => groupAssessmentsByPlayer(assessments), [assessments]);
  const valoracionOptions = useMemo(() => buildValoracionOptions(assessments), [assessments]);

  return (
    <div className="flex h-[640px] flex-col gap-4 rounded-lg border border-border bg-surface p-4">
      <Segmented.Root defaultValue="suma-pliegues" className="flex min-h-0 flex-1 flex-col gap-4">
        <Segmented.List>
          <Segmented.Trigger value="suma-pliegues">Rep. Suma Pliegues</Segmented.Trigger>
          <Segmented.Trigger value="peso-mlg">Rep. Peso Corp. Mlg</Segmented.Trigger>
          <Segmented.Trigger value="iaks">Rep. IAKS</Segmented.Trigger>
          <Segmented.Trigger value="tabla-resumen">Tabla_Resumen</Segmented.Trigger>
          <Segmented.Trigger value="resumen-jugador">Resumen por Jugador</Segmented.Trigger>
        </Segmented.List>

        <Segmented.Content value="suma-pliegues" className="min-h-0 flex-1">
          <SingleMetricReport
            players={players}
            assessmentsByPlayer={assessmentsByPlayer}
            valoracionOptions={valoracionOptions}
            categories={categories}
            positions={positions}
            threshold={thresholds.skinfold_sum}
            metricKey="skinfold_sum_6"
            metricLabel="Suma 6 Pliegues"
            unit=" mm"
            decimals={1}
          />
        </Segmented.Content>

        <Segmented.Content value="peso-mlg" className="min-h-0 flex-1">
          <BodyWeightReport
            players={players}
            assessmentsByPlayer={assessmentsByPlayer}
            valoracionOptions={valoracionOptions}
            categories={categories}
            positions={positions}
          />
        </Segmented.Content>

        <Segmented.Content value="iaks" className="min-h-0 flex-1">
          <SingleMetricReport
            players={players}
            assessmentsByPlayer={assessmentsByPlayer}
            valoracionOptions={valoracionOptions}
            categories={categories}
            positions={positions}
            threshold={thresholds.aks_index}
            metricKey="aks_index"
            metricLabel="Índice AKS"
            unit=""
            decimals={2}
          />
        </Segmented.Content>

        <Segmented.Content value="tabla-resumen" className="min-h-0 flex-1">
          <SummaryTableReport
            players={players}
            assessmentsByPlayer={assessmentsByPlayer}
            valoracionOptions={valoracionOptions}
            categories={categories}
            positions={positions}
            thresholds={thresholds}
          />
        </Segmented.Content>

        <Segmented.Content value="resumen-jugador" className="min-h-0 flex-1">
          <PlayerSummaryReport
            players={players}
            assessmentsByPlayer={assessmentsByPlayer}
            categories={categories}
            threshold={thresholds.aks_index}
          />
        </Segmented.Content>
      </Segmented.Root>
    </div>
  );
}
