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

const CHART_HEIGHT = 380;
const COLUMN_WIDTH_SINGLE = 64;
const COLUMN_WIDTH_GROUPED = 96;

/**
 * Columnas verticales (una por jugador, o un grupo de 2 por jugador para
 * métricas agrupadas) -- eje X = jugador, eje Y = valor. Con un plantel
 * grande, el ancho total puede superar el contenedor: el wrapper fuerza un
 * minWidth calculado y el borde exterior scrollea horizontal (en vez de
 * apretar/rotar decenas de nombres en el mismo ancho fijo). Líneas de
 * referencia horizontales cuando hay umbral configurado.
 */
export function ReportBarChart({
  data,
  series,
  threshold,
}: {
  data: Array<Record<string, string | number | null>>;
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
  const chartWidth = data.length * perColumn;

  return (
    <div className="overflow-x-auto rounded-lg border border-border" style={{ height: CHART_HEIGHT }}>
      <div style={{ minWidth: chartWidth, width: "100%", height: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 64 }}>
            <CartesianGrid stroke={BORDER} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: MUTED }}
              angle={-40}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis tick={{ fontSize: 11, fill: MUTED }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: BORDER }} />
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
