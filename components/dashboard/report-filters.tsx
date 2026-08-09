"use client";

import { FilterSelect } from "@/components/ui/filter-select";
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
    // Scroll horizontal en mobile en vez de wrap -- ver DashboardFilterBar.
    <div className="flex gap-3 overflow-x-auto pb-1 [&>*]:shrink-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
      <FilterSelect
        aria-label="Filtrar por posición"
        value={positionId}
        onValueChange={onPositionChange}
        options={[
          { value: ALL, label: "Todas las posiciones" },
          ...positions.map((position) => ({ value: position.id, label: position.name })),
        ]}
      />

      <FilterSelect
        aria-label="Filtrar por categoría"
        value={categoryId}
        onValueChange={onCategoryChange}
        options={[
          { value: ALL, label: "Todas las categorías" },
          ...categories.map((category) => ({ value: category.id, label: category.name })),
        ]}
      />

      <FilterSelect
        aria-label="Filtrar por valoración"
        value={valoracionLabel}
        onValueChange={onValoracionChange}
        options={[
          { value: LATEST, label: "Valoración más reciente" },
          ...valoracionOptions.map((option) => ({ value: option.label, label: `${option.label} · ${option.date}` })),
        ]}
      />
    </div>
  );
}
