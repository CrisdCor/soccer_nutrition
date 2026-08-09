"use client";

import { ALL, LATEST } from "@/lib/dashboard/report-helpers";

type CatalogOption = { id: string; name: string };

/**
 * Categoría/Posición/Valoración -- comunes a las 4 visualizaciones que
 * tienen "vista general" (todas menos Resumen por Jugador, que exige
 * seleccionar un jugador puntual y tiene su propia barra de filtros).
 */
export function ReportFilters({
  categories,
  positions,
  valoracionOptions,
  categoryId,
  onCategoryChange,
  positionId,
  onPositionChange,
  valoracionLabel,
  onValoracionChange,
}: {
  categories: CatalogOption[];
  positions: CatalogOption[];
  valoracionOptions: { label: string; date: string }[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  positionId: string;
  onPositionChange: (id: string) => void;
  valoracionLabel: string;
  onValoracionChange: (label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <select className="select w-auto" value={positionId} onChange={(e) => onPositionChange(e.target.value)}>
        <option value={ALL}>Todas las posiciones</option>
        {positions.map((position) => (
          <option key={position.id} value={position.id}>
            {position.name}
          </option>
        ))}
      </select>

      <select className="select w-auto" value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value={ALL}>Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select className="select w-auto" value={valoracionLabel} onChange={(e) => onValoracionChange(e.target.value)}>
        <option value={LATEST}>Valoración más reciente</option>
        {valoracionOptions.map((option) => (
          <option key={option.label} value={option.label}>
            {option.label} · {option.date}
          </option>
        ))}
      </select>
    </div>
  );
}
