"use client";

import { useMemo, useState } from "react";
import * as Sheet from "@/components/ui/sheet";
import { FilterSelect } from "@/components/ui/filter-select";
import { PlayerSearchSelect } from "@/components/ui/player-search-select";
import { buildValoracionOptions } from "@/lib/dashboard/report-helpers";
import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";

type CatalogOption = { id: string; name: string };
type ReportMode = "grupal" | "individual";

/**
 * Botón "Generar reporte" del Dashboard: abre un selector con un toggle
 * Grupal/Individual y dispara la descarga del Informe General en PDF (ver
 * app/api/reportes/pdf/route.tsx).
 * - Grupal: Categoría + Valoración -- portada + tabla grupal + una página
 *   por jugador de la categoría (comportamiento original, sin cambios).
 * - Individual: Categoría (para acotar la búsqueda) + Jugador (autocomplete
 *   por nombre, PlayerSearchSelect) + Valoración DE ESE JUGADOR -- portada
 *   + una sola página individual.
 * En los dos modos no hay opción "todas/más reciente": el reporte siempre
 * es de una valoración puntual.
 */
export function GenerateReportButton({
  categories,
  players,
  assessments,
}: {
  categories: CatalogOption[];
  players: ReportPlayer[];
  assessments: ReportAssessment[];
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ReportMode>("grupal");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [playerId, setPlayerId] = useState("");

  // Grupal: valoraciones disponibles en toda la categoría (sin filtrar por
  // categoría acá -- buildValoracionOptions ya viene de `assessments`
  // completo, igual que antes de este cambio).
  const valoracionOptions = useMemo(() => buildValoracionOptions(assessments), [assessments]);
  const [valoracionLabel, setValoracionLabel] = useState(valoracionOptions[0]?.label ?? "");

  // Individual: jugadores activos de la categoría elegida. Si al cambiar de
  // categoría el jugador ya elegido no está en la lista nueva, se deriva el
  // primero disponible acá mismo (mismo patrón que PlayerSummaryReport) en
  // vez de sincronizar el estado con un efecto.
  const categoryPlayers = useMemo(
    () => players.filter((player) => player.category?.id === categoryId),
    [players, categoryId]
  );
  const effectivePlayerId = categoryPlayers.some((player) => player.id === playerId)
    ? playerId
    : (categoryPlayers[0]?.id ?? "");

  // Individual: valoraciones DE ESE JUGADOR puntual, no de toda la categoría.
  const playerValoracionOptions = useMemo(
    () => buildValoracionOptions(assessments.filter((a) => a.player_id === effectivePlayerId)),
    [assessments, effectivePlayerId]
  );
  const [playerValoracionLabel, setPlayerValoracionLabel] = useState("");
  const effectivePlayerValoracionLabel = playerValoracionOptions.some(
    (option) => option.label === playerValoracionLabel
  )
    ? playerValoracionLabel
    : (playerValoracionOptions[0]?.label ?? "");

  const hasGrupalOptions = categories.length > 0 && valoracionOptions.length > 0;
  const hasIndividualOptions = categoryPlayers.length > 0 && playerValoracionOptions.length > 0;

  // Mismos parámetros para los dos formatos -- solo cambia el endpoint
  // (ver app/api/reportes/pdf/route.tsx y app/api/reportes/docx/route.ts,
  // que arman exactamente los mismos datos).
  const reportQuery =
    mode === "grupal"
      ? hasGrupalOptions && categoryId && valoracionLabel
        ? `mode=grupal&category=${encodeURIComponent(categoryId)}&valoracion=${encodeURIComponent(valoracionLabel)}`
        : undefined
      : hasIndividualOptions && effectivePlayerId && effectivePlayerValoracionLabel
        ? `mode=individual&player=${encodeURIComponent(effectivePlayerId)}&valoracion=${encodeURIComponent(effectivePlayerValoracionLabel)}`
        : undefined;

  const downloadHrefPdf = reportQuery ? `/api/reportes/pdf?${reportQuery}` : undefined;
  const downloadHrefDocx = reportQuery ? `/api/reportes/docx?${reportQuery}` : undefined;

  // El caso "sin ninguna valoración registrada todavía" en modo grupal
  // queda cubierto por este mensaje genérico; en individual, por los
  // mensajes más específicos más abajo (sin jugadores en la categoría / sin
  // valoraciones de ese jugador) -- no hace falta duplicarlo acá.
  const hasOptions = categories.length > 0;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        Generar reporte
      </button>

      <Sheet.Root open={open} onOpenChange={setOpen}>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>Generar reporte</Sheet.Title>
            <Sheet.Description>Informe general en PDF, grupal o de un jugador puntual.</Sheet.Description>
          </Sheet.Header>
          <Sheet.Body>
            {!hasOptions ? (
              <p className="text-sm text-muted">
                Hace falta al menos una categoría activa y una valoración registrada para generar el reporte.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex rounded-md border border-border p-0.5">
                  <ModeButton label="Grupal" active={mode === "grupal"} onClick={() => setMode("grupal")} />
                  <ModeButton
                    label="Individual"
                    active={mode === "individual"}
                    onClick={() => setMode("individual")}
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">Categoría</p>
                  <FilterSelect
                    aria-label="Categoría"
                    value={categoryId}
                    onValueChange={(value) => {
                      setCategoryId(value);
                      setPlayerId("");
                    }}
                    options={categories.map((category) => ({ value: category.id, label: category.name }))}
                  />
                </div>

                {mode === "grupal" ? (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">Valoración</p>
                    {valoracionOptions.length === 0 ? (
                      <p className="text-sm text-muted">Todavía no hay valoraciones registradas.</p>
                    ) : (
                      <FilterSelect
                        aria-label="Valoración"
                        value={valoracionLabel}
                        onValueChange={setValoracionLabel}
                        options={valoracionOptions.map((option) => ({
                          value: option.label,
                          label: `${option.label} · ${option.date}`,
                        }))}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">Jugador</p>
                      {categoryPlayers.length === 0 ? (
                        <p className="text-sm text-muted">No hay jugadores activos en esta categoría.</p>
                      ) : (
                        <PlayerSearchSelect
                          // key={categoryId}: PlayerSearchSelect solo lee su
                          // prop `value` para el texto inicial (estado local
                          // interno de ahí en más, ver el componente) -- sin
                          // esto, cambiar de categoría re-deriva
                          // effectivePlayerId a otro jugador pero el input
                          // se queda mostrando el nombre del jugador
                          // anterior. Forzar el remount al cambiar de
                          // categoría es más simple que sincronizar el
                          // estado interno con un efecto.
                          key={categoryId}
                          players={categoryPlayers}
                          value={effectivePlayerId}
                          onChange={setPlayerId}
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">Valoración</p>
                      {playerValoracionOptions.length === 0 ? (
                        <p className="text-sm text-muted">
                          {effectivePlayerId
                            ? "Este jugador no tiene valoraciones registradas."
                            : "Elige un jugador primero."}
                        </p>
                      ) : (
                        <FilterSelect
                          aria-label="Valoración"
                          value={effectivePlayerValoracionLabel}
                          onValueChange={setPlayerValoracionLabel}
                          options={playerValoracionOptions.map((option) => ({
                            value: option.label,
                            label: `${option.label} · ${option.date}`,
                          }))}
                        />
                      )}
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  {downloadHrefPdf ? (
                    <a href={downloadHrefPdf} onClick={() => setOpen(false)} className="btn-primary flex-1">
                      Descargar PDF
                    </a>
                  ) : (
                    <button type="button" disabled className="btn-primary flex-1">
                      Descargar PDF
                    </button>
                  )}
                  {downloadHrefDocx ? (
                    <a href={downloadHrefDocx} onClick={() => setOpen(false)} className="btn-secondary flex-1">
                      Descargar Word
                    </a>
                  ) : (
                    <button type="button" disabled className="btn-secondary flex-1">
                      Descargar Word
                    </button>
                  )}
                </div>
              </div>
            )}
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>
    </>
  );
}

function ModeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-foreground text-white" : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
