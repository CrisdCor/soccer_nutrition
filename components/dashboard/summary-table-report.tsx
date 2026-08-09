"use client";

import { useMemo, useState } from "react";
import { RangeBadge } from "@/components/dashboard/range-badge";
import { ReportFilters } from "@/components/dashboard/report-filters";
import { TopNControl } from "@/components/dashboard/top-n-control";
import { computeDisplayAge } from "@/lib/calculations";
import type { CurrentThresholds } from "@/lib/configuracion/queries";
import { ALL, LATEST, selectPlayerAssessments, type PlayerAssessmentPair, type TopNDirection } from "@/lib/dashboard/report-helpers";
import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";
import { formatIndicator, formatPercentage } from "@/lib/format";

type CatalogOption = { id: string; name: string };
type SortKey = "position" | "name" | "age" | "height" | "weight" | "musclePct" | "skinfoldSum" | "aks";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "position", label: "Posición" },
  { key: "name", label: "Nombre" },
  { key: "age", label: "Edad" },
  { key: "height", label: "Talla" },
  { key: "weight", label: "Peso" },
  { key: "musclePct", label: "% Masa Muscular" },
  { key: "skinfoldSum", label: "Suma 6 Pliegues" },
  { key: "aks", label: "Índice AKS" },
];

function sortValue(pair: PlayerAssessmentPair, key: SortKey): number | string {
  switch (key) {
    case "position":
      return pair.player.position?.name ?? "";
    case "name":
      return pair.player.full_name;
    case "age":
      return computeDisplayAge(new Date(pair.player.birth_date), new Date(pair.assessment.assessment_date));
    case "height":
      return pair.assessment.height_cm;
    case "weight":
      return pair.assessment.weight_kg;
    case "musclePct":
      return pair.assessment.muscle_percentage ?? -Infinity;
    case "skinfoldSum":
      return pair.assessment.skinfold_sum_6 ?? -Infinity;
    case "aks":
      return pair.assessment.aks_index ?? -Infinity;
  }
}

/**
 * Solo tabla, sin toggle a barras. Columnas ordenables por click de
 * encabezado (default: Nombre asc) -- el Top N acá no se basa en una
 * métrica fija, sino en la columna/dirección por la que esté ordenada la
 * tabla en ese momento (primeros N = "mejores", últimos N = "peores").
 * "Índice AKS" es la etiqueta usada -- el Excel original dice "Suma de
 * AKS", pero el contenido es el valor del índice de cada jugador, no una
 * sumatoria; se relabelea para no confundir.
 */
export function SummaryTableReport({
  players,
  assessmentsByPlayer,
  valoracionOptions,
  categories,
  positions,
  thresholds,
}: {
  players: ReportPlayer[];
  assessmentsByPlayer: Map<string, ReportAssessment[]>;
  valoracionOptions: { label: string; date: string }[];
  categories: CatalogOption[];
  positions: CatalogOption[];
  thresholds: CurrentThresholds;
}) {
  const [categoryId, setCategoryId] = useState(ALL);
  const [positionId, setPositionId] = useState(ALL);
  const [valoracionLabel, setValoracionLabel] = useState(LATEST);
  const [topNDirection, setTopNDirection] = useState<TopNDirection>(null);
  const [topN, setTopN] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

  const sorted = useMemo(() => {
    const copy = [...pairs];
    copy.sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      const cmp = typeof va === "string" ? va.localeCompare(vb as string, "es") : va - (vb as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [pairs, sortKey, sortDir]);

  const rows = useMemo(() => {
    if (!topNDirection) return sorted;
    return topNDirection === "best" ? sorted.slice(0, topN) : sorted.slice(-topN);
  }, [sorted, topNDirection, topN]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

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
        <TopNControl direction={topNDirection} onDirectionChange={setTopNDirection} n={topN} onNChange={setTopN} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-border text-xs text-muted">
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {column.label}
                    {sortKey === column.key && <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((pair) => (
              <tr key={pair.player.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted">{pair.player.position?.name ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-foreground">{pair.player.full_name}</td>
                <td className="data px-4 py-3 text-muted">
                  {computeDisplayAge(new Date(pair.player.birth_date), new Date(pair.assessment.assessment_date))}
                </td>
                <td className="data px-4 py-3 text-muted">{formatIndicator(pair.assessment.height_cm, 1, " cm")}</td>
                <td className="data px-4 py-3 text-muted">{formatIndicator(pair.assessment.weight_kg, 1, " kg")}</td>
                <td className="data px-4 py-3 text-muted">{formatPercentage(pair.assessment.muscle_percentage)}</td>
                <td className="data px-4 py-3 text-muted">
                  {formatIndicator(pair.assessment.skinfold_sum_6, 1, " mm")}
                  <RangeBadge value={pair.assessment.skinfold_sum_6} threshold={thresholds.skinfold_sum} />
                </td>
                <td className="data px-4 py-3 text-muted">
                  {formatIndicator(pair.assessment.aks_index, 2)}
                  <RangeBadge value={pair.assessment.aks_index} threshold={thresholds.aks_index} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-sm text-muted">
                  No hay datos para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
