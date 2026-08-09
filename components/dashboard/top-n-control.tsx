"use client";

import { FilterSelect } from "@/components/ui/filter-select";
import type { TopNDirection } from "@/lib/dashboard/report-helpers";

const OPTIONS = [
  { value: "none", label: "Todos" },
  { value: "best", label: "Top mejores" },
  { value: "worst", label: "Top peores" },
];

/**
 * "Todos" (sin recorte, default) / "Top N mejores" / "Top N peores", con N
 * configurable (10 por defecto). Ver applyTopN() para qué significa
 * "mejor"/"peor" -- es literal (valor más bajo/alto), no un juicio clínico.
 */
export function TopNControl({
  direction,
  onDirectionChange,
  n,
  onNChange,
}: {
  direction: TopNDirection;
  onDirectionChange: (direction: TopNDirection) => void;
  n: number;
  onNChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <FilterSelect
        aria-label="Filtro Top N"
        value={direction ?? "none"}
        onValueChange={(value) => onDirectionChange(value === "none" ? null : (value as TopNDirection))}
        options={OPTIONS}
      />
      {direction && (
        <input
          type="number"
          min={1}
          max={200}
          className="input"
          style={{ width: "4.5rem" }}
          value={n}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            onNChange(Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1);
          }}
        />
      )}
    </div>
  );
}
