"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/ui/filter-select";
import { PlayerSearchSelect } from "@/components/ui/player-search-select";
import { buildValoracionOptions } from "@/lib/dashboard/report-helpers";
import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";

type CatalogOption = { id: string; name: string };
type ReportMode = "grupal" | "individual";

/**
 * Contenido de la pantalla /reportes: selector Grupal/Individual + filtros
 * de Categoría/Jugador/Valoración + descarga PDF/Word. Antes vivía como
 * Sheet disparado por un botón dentro del Dashboard (GenerateReportButton);
 * ahora es su propia ruta con ítem propio en la navegación (ver
 * components/layout/sidebar.tsx), así que esto es directamente el
 * contenido de la página, sin el wrapper de Sheet ni el botón/estado
 * open/close -- la lógica de estado/derivación de filtros es la misma.
 */
export function ReportForm({
  categories,
  players,
  assessments,
}: {
  categories: CatalogOption[];
  players: ReportPlayer[];
  assessments: ReportAssessment[];
}) {
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

  const hasOptions = categories.length > 0;

  if (!hasOptions) {
    return (
      <p className="text-sm text-muted">
        Hace falta al menos una categoría activa y una valoración registrada para generar el reporte.
      </p>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="inline-flex rounded-md border border-border p-0.5">
        <ModeButton label="Grupal" active={mode === "grupal"} onClick={() => setMode("grupal")} />
        <ModeButton label="Individual" active={mode === "individual"} onClick={() => setMode("individual")} />
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
                // key={categoryId}: PlayerSearchSelect solo lee su prop
                // `value` para el texto inicial (estado local interno de
                // ahí en más, ver el componente) -- sin esto, cambiar de
                // categoría re-deriva effectivePlayerId a otro jugador
                // pero el input se queda mostrando el nombre del jugador
                // anterior. Forzar el remount al cambiar de categoría es
                // más simple que sincronizar el estado interno con un
                // efecto.
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
                {effectivePlayerId ? "Este jugador no tiene valoraciones registradas." : "Elige un jugador primero."}
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
          <a href={downloadHrefPdf} className="btn-primary flex-1">
            Descargar PDF
          </a>
        ) : (
          <button type="button" disabled className="btn-primary flex-1">
            Descargar PDF
          </button>
        )}
        {downloadHrefDocx ? (
          <a href={downloadHrefDocx} className="btn-secondary flex-1">
            Descargar Word
          </a>
        ) : (
          <button type="button" disabled className="btn-secondary flex-1">
            Descargar Word
          </button>
        )}
      </div>
    </div>
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
