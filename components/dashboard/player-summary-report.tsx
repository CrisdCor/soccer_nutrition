"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterSelect } from "@/components/ui/filter-select";
import { ALL, LATEST } from "@/lib/dashboard/report-helpers";
import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";
import { formatIndicator } from "@/lib/format";
import type { ThresholdRange } from "@/lib/format";

type CatalogOption = { id: string; name: string };

const RED = "#c8102e";
const BLUE = "#1d3557";
const BORDER = "#e4e4e7";
const MUTED = "#71717a";

const SKINFOLD_AXES: { key: keyof ReportAssessment; label: string }[] = [
  { key: "skinfold_triceps", label: "Tríceps" },
  { key: "skinfold_subscapular", label: "Subescapular" },
  { key: "skinfold_supraspinal", label: "Supraespinal" },
  { key: "skinfold_abdominal", label: "Abdominal" },
  { key: "skinfold_thigh", label: "Muslo" },
  { key: "skinfold_calf", label: "Pierna" },
  { key: "skinfold_biceps", label: "Bíceps" },
  { key: "skinfold_iliac_crest", label: "Cresta ilíaca" },
];

/**
 * Único bloque con filtros obligatorios (Jugador, Categoría, Valoración):
 * a diferencia de las otras 4 visualizaciones, no tiene sentido una "vista
 * general" mezclando jugadores acá. Sin tabla ni Top N (no hay nada que
 * rankear con un solo jugador seleccionado) -- solo el radar de 8 pliegues
 * de la valoración elegida y la evolución de AKS a través de todas sus
 * valoraciones. Métrica de evolución: Índice AKS, por ser el indicador más
 * directamente ligado a este análisis de composición corporal -- si se
 * prefiere Peso o Suma de Pliegues, es un cambio de una línea. Único
 * gráfico de línea de las 5 visualizaciones (el resto son barras): acá sí
 * tiene sentido, porque el eje X es tiempo (valoraciones sucesivas del
 * mismo jugador) y lo que importa es la tendencia, no comparar barras
 * entre sí. Con líneas de referencia horizontales del umbral AKS, igual
 * que el resto de las vistas con umbral configurado.
 */
export function PlayerSummaryReport({
  players,
  assessmentsByPlayer,
  categories,
  threshold,
}: {
  players: ReportPlayer[];
  assessmentsByPlayer: Map<string, ReportAssessment[]>;
  categories: CatalogOption[];
  threshold: ThresholdRange | null;
}) {
  const [categoryId, setCategoryId] = useState(ALL);
  const [playerId, setPlayerId] = useState("");
  const [valoracionLabel, setValoracionLabel] = useState(LATEST);

  const filteredPlayers = useMemo(
    () => players.filter((player) => categoryId === ALL || player.category?.id === categoryId),
    [players, categoryId]
  );

  // Si cambia la categoría y el jugador elegido ya no está en la lista (o
  // todavía no se eligió ninguno), se deriva el primero disponible acá
  // mismo en vez de sincronizar el estado con un efecto -- nunca queda
  // vacío mientras haya jugadores para elegir, y evita el cascading-render
  // de llamar setState dentro de un useEffect.
  const effectivePlayerId = filteredPlayers.some((p) => p.id === playerId)
    ? playerId
    : (filteredPlayers[0]?.id ?? "");

  const player = filteredPlayers.find((p) => p.id === effectivePlayerId) ?? null;
  const history = player ? assessmentsByPlayer.get(player.id) ?? [] : [];

  // Mismo criterio: si la etiqueta elegida no existe en el historial del
  // jugador actual (típicamente porque se acaba de cambiar de jugador),
  // cae en "más reciente" sin necesitar un efecto que la resetee.
  const effectiveValoracionLabel =
    valoracionLabel === LATEST || history.some((a) => a.label === valoracionLabel) ? valoracionLabel : LATEST;

  const assessment =
    effectiveValoracionLabel === LATEST
      ? history[history.length - 1]
      : [...history].reverse().find((a) => a.label === effectiveValoracionLabel);

  const missingAxes = assessment ? SKINFOLD_AXES.filter((axis) => assessment[axis.key] == null) : [];

  const radarData = SKINFOLD_AXES.map((axis) => ({
    axis: axis.label,
    value: assessment ? (assessment[axis.key] as number | null) ?? 0 : 0,
  }));

  const evolutionData = history.map((a) => ({
    name: `${a.assessment_date}${a.label ? ` · ${a.label}` : ""}`,
    aks_index: a.aks_index,
  }));

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          aria-label="Filtrar por categoría"
          value={categoryId}
          onValueChange={setCategoryId}
          options={[
            { value: ALL, label: "Todas las categorías" },
            ...categories.map((category) => ({ value: category.id, label: category.name })),
          ]}
        />

        <FilterSelect
          aria-label="Jugador"
          value={effectivePlayerId}
          onValueChange={setPlayerId}
          disabled={filteredPlayers.length === 0}
          placeholder="Sin jugadores"
          options={filteredPlayers.map((p) => ({ value: p.id, label: p.full_name }))}
        />

        <FilterSelect
          aria-label="Filtrar por valoración"
          value={effectiveValoracionLabel}
          onValueChange={setValoracionLabel}
          disabled={history.length === 0}
          options={[
            { value: LATEST, label: "Valoración más reciente" },
            ...[...history].reverse().map((a) => ({ value: a.label, label: `${a.label} · ${a.assessment_date}` })),
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!player || !assessment ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border-strong text-sm text-muted">
            {player ? "Este jugador todavía no tiene valoraciones registradas." : "No hay jugadores para mostrar."}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <h4 className="px-1 text-sm font-semibold text-foreground">
                Pliegues cutáneos -- {assessment.label} · {assessment.assessment_date}
              </h4>
              {missingAxes.length > 0 && (
                <p className="px-1 pt-1 text-xs text-muted">
                  Dato insuficiente: {missingAxes.map((a) => a.label).join(", ")} (graficado como 0).
                </p>
              )}
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke={BORDER} />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: MUTED }} />
                    <PolarRadiusAxis tick={{ fontSize: 10, fill: MUTED }} />
                    <Radar dataKey="value" stroke={RED} fill={RED} fillOpacity={0.25} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: BORDER }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <h4 className="px-1 text-sm font-semibold text-foreground">Evolución -- Índice AKS</h4>
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 8, right: 16, left: 0, bottom: 56 }}>
                    <CartesianGrid stroke={BORDER} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: MUTED }}
                      angle={-40}
                      textAnchor="end"
                      interval={0}
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 11, fill: MUTED }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: BORDER }}
                      formatter={(value) => formatIndicator(typeof value === "number" ? value : null, 2)}
                    />
                    {threshold && (
                      <>
                        <ReferenceLine
                          y={threshold.low_cut}
                          stroke={BLUE}
                          strokeDasharray="4 4"
                          label={{ value: `Mín ${threshold.low_cut}`, position: "insideBottomLeft", fontSize: 10, fill: BLUE }}
                        />
                        <ReferenceLine
                          y={threshold.high_cut}
                          stroke={BLUE}
                          strokeDasharray="4 4"
                          label={{ value: `Máx ${threshold.high_cut}`, position: "insideTopLeft", fontSize: 10, fill: BLUE }}
                        />
                      </>
                    )}
                    {/* connectNulls deliberadamente en false (default): una
                        valoración sin AKS calculado corta la línea en vez de
                        interpolar entre las vecinas -- "dato insuficiente"
                        nunca se disimula como una tendencia continua. */}
                    <Line type="monotone" dataKey="aks_index" name="Índice AKS" stroke={RED} strokeWidth={2} dot={{ r: 3, fill: RED }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
