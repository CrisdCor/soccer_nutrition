"use client";

import { useMemo, useState } from "react";
import * as Sheet from "@/components/ui/sheet";
import { FilterSelect } from "@/components/ui/filter-select";
import { buildValoracionOptions } from "@/lib/dashboard/report-helpers";
import type { ReportAssessment } from "@/lib/dashboard/report-queries";

type CatalogOption = { id: string; name: string };

/**
 * Botón "Generar reporte" del Dashboard: abre un selector simple de
 * Categoría + Valoración y dispara la descarga del Informe General en PDF
 * (portada + tabla grupal + una página por jugador -- ver
 * app/api/reportes/pdf/route.tsx). A diferencia de los filtros de
 * Visualizaciones, acá no hay opción "todas/más reciente": el reporte
 * siempre es de una categoría y una valoración puntuales.
 */
export function GenerateReportButton({
  categories,
  assessments,
}: {
  categories: CatalogOption[];
  assessments: ReportAssessment[];
}) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");

  const valoracionOptions = useMemo(() => buildValoracionOptions(assessments), [assessments]);
  const [valoracionLabel, setValoracionLabel] = useState(valoracionOptions[0]?.label ?? "");

  const hasOptions = categories.length > 0 && valoracionOptions.length > 0;
  const downloadHref =
    hasOptions && categoryId && valoracionLabel
      ? `/api/reportes/pdf?category=${encodeURIComponent(categoryId)}&valoracion=${encodeURIComponent(valoracionLabel)}`
      : undefined;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        Generar reporte
      </button>

      <Sheet.Root open={open} onOpenChange={setOpen}>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>Generar reporte</Sheet.Title>
            <Sheet.Description>
              Informe general en PDF de una categoría en una valoración puntual.
            </Sheet.Description>
          </Sheet.Header>
          <Sheet.Body>
            {!hasOptions ? (
              <p className="text-sm text-muted">
                Hace falta al menos una categoría activa y una valoración registrada para generar el reporte.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">Categoría</p>
                  <FilterSelect
                    aria-label="Categoría"
                    value={categoryId}
                    onValueChange={setCategoryId}
                    options={categories.map((category) => ({ value: category.id, label: category.name }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">Valoración</p>
                  <FilterSelect
                    aria-label="Valoración"
                    value={valoracionLabel}
                    onValueChange={setValoracionLabel}
                    options={valoracionOptions.map((option) => ({
                      value: option.label,
                      label: `${option.label} · ${option.date}`,
                    }))}
                  />
                </div>

                {downloadHref ? (
                  <a href={downloadHref} onClick={() => setOpen(false)} className="btn-primary w-full">
                    Descargar PDF
                  </a>
                ) : (
                  <button type="button" disabled className="btn-primary w-full">
                    Descargar PDF
                  </button>
                )}
              </div>
            )}
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>
    </>
  );
}
