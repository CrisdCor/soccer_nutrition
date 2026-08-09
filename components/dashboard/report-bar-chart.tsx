"use client";

import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ThresholdRange } from "@/lib/format";

// Mismos valores que los tokens de app/globals.css -- se hardcodean acá en
// vez de "var(--color-...)" porque el tema es exclusivamente claro (no hay
// segunda paleta que resolver) y evita depender de que cada versión de
// recharts aplique los props de color como atributo SVG vs. style inline.
const RED = "#c8102e";
const BLUE = "#1d3557";
const BORDER = "#e4e4e7";
const MUTED = "#71717a";

export type BarSeries = { key: string; label: string; color: "red" | "blue" };
const COLOR: Record<BarSeries["color"], string> = { red: RED, blue: BLUE };

const CHART_HEIGHT = 320;
const COLUMN_WIDTH_SINGLE = 56;
const COLUMN_WIDTH_GROUPED = 88;
const MIN_CHART_WIDTH = 320;

export type BarChartDatum = Record<string, string | number | null> & { name: string; shortName: string };

/**
 * Columnas verticales (una por jugador, o un grupo de 2 por jugador para
 * métricas agrupadas) -- eje X = jugador (nombre corto, ej. "Adrián M.";
 * el nombre completo va en el tooltip), eje Y = valor. Con un plantel
 * grande, el ancho total supera el contenedor: SOLO scroll horizontal
 * (`overflow-x-auto overflow-y-hidden` explícitos en ambos ejes -- dejar
 * overflow-y en su valor inicial "visible" mientras overflow-x es "auto"
 * hace que el navegador lo compute como "auto" también, por spec de CSS;
 * eso deja la puerta abierta a que aparezca un scrollbar vertical además
 * del horizontal, y la interacción entre los dos scrollbars-- cada uno le
 * come espacio al otro eje -- es lo que causaba el titileo: ResizeObserver
 * de Recharts detecta el cambio de tamaño, redibuja, eso cambia si hace
 * falta el scrollbar, vuelve a redibujar, indefinidamente). El ancho del
 * wrapper que mide ResponsiveContainer es un píxel fijo siempre (nunca
 * `100%`/`h-full`/heredado) -- ese es el otro requisito para que Recharts
 * no entre en el mismo bucle de remedición.
 */
export function ReportBarChart({
  data,
  series,
  threshold,
}: {
  data: BarChartDatum[];
  series: BarSeries[];
  threshold?: ThresholdRange | null;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border-strong text-sm text-muted">
        No hay datos para los filtros seleccionados.
      </div>
    );
  }

  const perColumn = series.length > 1 ? COLUMN_WIDTH_GROUPED : COLUMN_WIDTH_SINGLE;
  const chartWidth = Math.max(MIN_CHART_WIDTH, data.length * perColumn);

  return (
    <div
      className="overflow-x-auto overflow-y-hidden rounded-lg border border-border"
      style={{ height: CHART_HEIGHT }}
    >
      <div style={{ width: chartWidth, height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 11, fill: MUTED }}
              interval={0}
              height={32}
            />
            <YAxis tick={{ fontSize: 11, fill: MUTED }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: BORDER }}
              labelFormatter={(_, payload) => fullNameFromPayload(payload)}
            />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={COLOR[s.color]} radius={[2, 2, 0, 0]} barSize={20} />
            ))}
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
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// El eje X grafica shortName ("Adrián M."), pero el tooltip debe mostrar
// el nombre completo -- viaja en el mismo punto de datos (`name`), así que
// se lee del payload en vez de duplicar el dataKey del eje.
function fullNameFromPayload(payload: ReadonlyArray<{ payload?: BarChartDatum }> | undefined): string {
  return payload?.[0]?.payload?.name ?? "";
}
