"use client";

import { useMemo, useState } from "react";
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
  type SortDirection,
  type TopNDirection,
} from "@/lib/dashboard/report-helpers";
import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";
import { formatIndicator } from "@/lib/format";

type CatalogOption = { id: string; name: string };

/**
 * Peso Corporal + Masa Libre de Grasa por jugador -- sin umbral de
 * referencia (es puramente comparativo, no hay reference_thresholds para
 * esta métrica), así que no hay líneas ni badges de color acá. Barras
 * agrupadas (una al lado de la otra), no apiladas. Top N ordena por Peso
 * Corporal por defecto -- no se especificó cuál de las dos métricas usar.
 */
export function BodyWeightReport({
  players,
  assessmentsByPlayer,
  valoracionOptions,
  categories,
  positions,
}: {
  players: ReportPlayer[];
  assessmentsByPlayer: Map<string, ReportAssessment[]>;
  valoracionOptions: { label: string; date: string }[];
  categories: CatalogOption[];
  positions: CatalogOption[];
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

  // Peso Corporal es la métrica de referencia tanto para Top N como para
  // el orden mayor/menor -- no se especificó cuál de las dos usar, y se
  // eligió la misma para ambos controles por consistencia.
  const getValue = (pair: (typeof pairs)[number]) => pair.assessment.weight_kg;

  const rows = useMemo(
    () => sortByValue(applyTopN(pairs, getValue, topNDirection, topN), getValue, sortDirection),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pairs, topNDirection, topN, sortDirection]
  );

  const chartData = rows.map((pair) => ({
    name: pair.player.full_name,
    shortName: shortenName(pair.player.full_name),
    weight_kg: pair.assessment.weight_kg,
    fat_free_mass_kg: pair.assessment.fat_free_mass_kg,
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
            series={[
              { key: "weight_kg", label: "Peso corporal", color: "red" },
              { key: "fat_free_mass_kg", label: "Masa libre de grasa", color: "blue" },
            ]}
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
                  label: "Peso corporal",
                  render: (pair) => <span className="data">{formatIndicator(pair.assessment.weight_kg, 1, " kg")}</span>,
                },
                {
                  label: "Masa libre de grasa",
                  render: (pair) => (
                    <span className="data">{formatIndicator(pair.assessment.fat_free_mass_kg, 2, " kg")}</span>
                  ),
                },
              ]}
            />

            <table className="hidden w-full text-left text-sm sm:table">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Peso corporal</th>
                  <th className="px-4 py-3 font-medium">Masa libre de grasa</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((pair) => (
                  <tr key={pair.player.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{pair.player.full_name}</td>
                    <td className="data px-4 py-3 text-muted">{formatIndicator(pair.assessment.weight_kg, 1, " kg")}</td>
                    <td className="data px-4 py-3 text-muted">
                      {formatIndicator(pair.assessment.fat_free_mass_kg, 2, " kg")}
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
