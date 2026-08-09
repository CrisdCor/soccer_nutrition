"use client";

import { useMemo, useState } from "react";
import { RangeBadge } from "@/components/dashboard/range-badge";
import { ReportBarChart } from "@/components/dashboard/report-bar-chart";
import { ReportFilters } from "@/components/dashboard/report-filters";
import { TopNControl } from "@/components/dashboard/top-n-control";
import { MobileCardList } from "@/components/ui/mobile-card-list";
import {
  ALL,
  LATEST,
  applyTopN,
  selectPlayerAssessments,
  shortenName,
  sortByValue,
  type PlayerAssessmentPair,
  type SortDirection,
  type TopNDirection,
} from "@/lib/dashboard/report-helpers";
import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";
import { formatIndicator } from "@/lib/format";
import type { ThresholdRange } from "@/lib/format";

type CatalogOption = { id: string; name: string };
type MetricKey = "skinfold_sum_6" | "aks_index";

/**
 * Una sola métrica por jugador (Suma 6 Pliegues o Índice AKS): tabla +
 * barras + Top N + umbral -- comparten exactamente la misma forma, así que
 * es un único componente parametrizado en vez de dos casi-duplicados.
 */
export function SingleMetricReport({
  players,
  assessmentsByPlayer,
  valoracionOptions,
  categories,
  positions,
  threshold,
  metricKey,
  metricLabel,
  unit,
  decimals,
}: {
  players: ReportPlayer[];
  assessmentsByPlayer: Map<string, ReportAssessment[]>;
  valoracionOptions: { label: string; date: string }[];
  categories: CatalogOption[];
  positions: CatalogOption[];
  threshold: ThresholdRange | null;
  metricKey: MetricKey;
  metricLabel: string;
  unit: string;
  decimals: number;
}) {
  const [categoryId, setCategoryId] = useState(ALL);
  const [positionId, setPositionId] = useState(ALL);
  const [valoracionLabel, setValoracionLabel] = useState(LATEST);
  const [topNDirection, setTopNDirection] = useState<TopNDirection>(null);
  const [topN, setTopN] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "bars">("bars");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const pairs = useMemo(
    () =>
      selectPlayerAssessments({
        players,
        assessmentsByPlayer,
        categoryId,
        positionId,
        valoracionLabel,
      }),
    [players, assessmentsByPlayer, categoryId, positionId, valoracionLabel]
  );

  const getValue = (pair: PlayerAssessmentPair) => pair.assessment[metricKey];

  const rows = useMemo(
    () => sortByValue(applyTopN(pairs, getValue, topNDirection, topN), getValue, sortDirection),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pairs, topNDirection, topN, sortDirection]
  );

  const chartData = rows.map((pair) => ({
    name: pair.player.full_name,
    shortName: shortenName(pair.player.full_name),
    [metricKey]: pair.assessment[metricKey],
  }));

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ReportFilters
          categories={categories}
          positions={positions}
          valoracionOptions={valoracionOptions}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          positionId={positionId}
          onPositionChange={setPositionId}
          valoracionLabel={valoracionLabel}
          onValoracionChange={setValoracionLabel}
        />
        <div className="flex items-center gap-3">
          <TopNControl direction={topNDirection} onDirectionChange={setTopNDirection} n={topN} onNChange={setTopN} />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
            aria-label={sortDirection === "desc" ? "Orden: mayor a menor" : "Orden: menor a mayor"}
          >
            {sortDirection === "desc" ? "↓ Mayor a menor" : "↑ Menor a mayor"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setViewMode(viewMode === "bars" ? "table" : "bars")}>
            {viewMode === "bars" ? "Ver tabla" : "Ver columnas"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {viewMode === "bars" ? (
          <ReportBarChart
            data={chartData}
            series={[{ key: metricKey, label: metricLabel, color: "red" }]}
            threshold={threshold}
          />
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong p-8 text-center text-sm text-muted">
            No hay datos para los filtros seleccionados.
          </p>
        ) : (
          <>
            <MobileCardList
              rows={rows}
              keyFor={(pair) => pair.player.id}
              title={(pair) => <span className="font-medium text-foreground">{pair.player.full_name}</span>}
              fields={[
                {
                  label: metricLabel,
                  render: (pair) => (
                    <>
                      <span className="data">{formatIndicator(pair.assessment[metricKey], decimals, unit)}</span>
                      <RangeBadge value={pair.assessment[metricKey]} threshold={threshold} />
                    </>
                  ),
                },
              ]}
            />

            <table className="hidden w-full text-left text-sm sm:table">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">{metricLabel}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((pair) => (
                  <tr key={pair.player.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{pair.player.full_name}</td>
                    <td className="data px-4 py-3 text-muted">
                      {formatIndicator(pair.assessment[metricKey], decimals, unit)}
                      <RangeBadge value={pair.assessment[metricKey]} threshold={threshold} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
