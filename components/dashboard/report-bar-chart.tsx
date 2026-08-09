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

const ROW_HEIGHT = 32;
const MIN_HEIGHT = 240;

/**
 * Barras horizontales (una fila por jugador) en vez de columnas verticales:
 * con un plantel grande, crecer hacia abajo (scroll vertical del propio
 * gráfico) es más legible que apretar/rotar decenas de nombres en el eje X.
 * Líneas de referencia verticales cuando hay umbral configurado.
 */
export function ReportBarChart({
  data,
  series,
  threshold,
  maxHeight = 420,
}: {
  data: Array<Record<string, string | number | null>>;
  series: BarSeries[];
  threshold?: ThresholdRange | null;
  maxHeight?: number;
}) {
  const chartHeight = Math.max(MIN_HEIGHT, data.length * ROW_HEIGHT);

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border-strong text-sm text-muted">
        No hay datos para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="overflow-y-auto rounded-lg border border-border" style={{ maxHeight }}>
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid stroke={BORDER} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: MUTED }}
              width={132}
              interval={0}
            />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: BORDER }} />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={COLOR[s.color]} radius={[0, 2, 2, 0]} barSize={16} />
            ))}
            {threshold && (
              <>
                <ReferenceLine
                  x={threshold.low_cut}
                  stroke={BLUE}
                  strokeDasharray="4 4"
                  label={{ value: `Mín ${threshold.low_cut}`, position: "insideTopLeft", fontSize: 10, fill: BLUE }}
                />
                <ReferenceLine
                  x={threshold.high_cut}
                  stroke={BLUE}
                  strokeDasharray="4 4"
                  label={{ value: `Máx ${threshold.high_cut}`, position: "insideBottomLeft", fontSize: 10, fill: BLUE }}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
