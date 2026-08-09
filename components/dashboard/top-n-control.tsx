"use client";

import type { TopNDirection } from "@/lib/dashboard/report-helpers";

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
      <select
        className="select w-auto"
        value={direction ?? "none"}
        onChange={(event) => {
          const value = event.target.value;
          onDirectionChange(value === "none" ? null : (value as TopNDirection));
        }}
      >
        <option value="none">Todos</option>
        <option value="best">Top mejores</option>
        <option value="worst">Top peores</option>
      </select>
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
