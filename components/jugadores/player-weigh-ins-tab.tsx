"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { classifyByThreshold, formatIndicator, type ThresholdRange } from "@/lib/format";
import type { WeighInRecord } from "@/lib/pesajes/queries";

const RED = "#c8102e";
const BLUE = "#1d3557";
const BORDER = "#e4e4e7";
const MUTED = "#71717a";

type ChartPoint = {
  recorded_at: string;
  label: string;
  weight_kg: number;
  changePct: number | null;
  isAnomaly: boolean;
};

/**
 * Tab "Peso Diario": línea de tiempo de daily_weigh_ins (no una valoración
 * antropométrica, ver spec) -- a diferencia de la evolución de AKS en
 * Resumen por Jugador (una barra de referencia horizontal porque el
 * umbral se aplica al mismo valor que se grafica), acá el umbral
 * (weight_change_pct) se aplica al % de cambio entre puntos consecutivos,
 * no al peso en sí -- no hay una ReferenceLine horizontal que tenga
 * sentido; la señal es el punto mismo: más grande y rojo si ese cambio
 * excede el umbral configurado, azul/normal si no.
 */
export function PlayerWeighInsTab({
  weighIns,
  threshold,
}: {
  /** Ascendente por recorded_at. */
  weighIns: WeighInRecord[];
  threshold: ThresholdRange | null;
}) {
  const data = useMemo(() => buildChartData(weighIns, threshold), [weighIns, threshold]);

  if (weighIns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
        Este jugador todavía no tiene pesajes registrados (ver &ldquo;Pesajes&rdquo; en la navegación).
      </div>
    );
  }

  const anomalyCount = data.filter((point) => point.isAnomaly).length;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
          <h4 className="text-sm font-semibold text-foreground">Peso diario -- todos los registros</h4>
          <p className="text-xs text-muted">
            {threshold ? (
              <>
                Puntos en rojo: variación &gt; {threshold.high_cut}% o &lt; {threshold.low_cut}% respecto al
                registro anterior{anomalyCount > 0 ? ` (${anomalyCount})` : ""}.
              </>
            ) : (
              "Sin umbral de variación configurado todavía (Configuración -- Umbrales de referencia)."
            )}
          </p>
        </div>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 56 }}>
              <CartesianGrid stroke={BORDER} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: MUTED }}
                angle={-40}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                tick={{ fontSize: 11, fill: MUTED }}
                domain={["dataMin - 1", "dataMax + 1"]}
                unit=" kg"
              />
              <Tooltip content={<WeighInTooltip />} />
              {/* connectNulls no aplica acá: weight_kg siempre viene con
                  dato (columna NOT NULL en daily_weigh_ins), a diferencia
                  del AKS que puede faltar por valoración incompleta. */}
              <Line
                type="monotone"
                dataKey="weight_kg"
                name="Peso"
                stroke={BLUE}
                strokeWidth={2}
                dot={renderDot}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function buildChartData(weighIns: WeighInRecord[], threshold: ThresholdRange | null): ChartPoint[] {
  return weighIns.map((entry, index) => {
    const previous = index > 0 ? weighIns[index - 1] : null;
    const changePct =
      previous && previous.weight_kg !== 0
        ? ((entry.weight_kg - previous.weight_kg) / previous.weight_kg) * 100
        : null;
    const classification = classifyByThreshold(changePct, threshold);

    return {
      recorded_at: entry.recorded_at,
      label: formatAxisLabel(entry.recorded_at),
      weight_kg: entry.weight_kg,
      changePct,
      isAnomaly: classification != null && classification !== "normal",
    };
  });
}

function renderDot(props: unknown) {
  const { cx, cy, payload, index } = props as {
    cx?: number;
    cy?: number;
    payload?: ChartPoint;
    index?: number;
  };
  if (cx == null || cy == null || !payload) return <g key={`dot-${index}`} />;

  const anomaly = payload.isAnomaly;
  return (
    <circle
      key={`dot-${index}`}
      cx={cx}
      cy={cy}
      r={anomaly ? 6 : 3}
      fill={anomaly ? RED : BLUE}
      stroke={anomaly ? RED : BLUE}
    />
  );
}

function WeighInTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${BORDER}`,
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 12,
      }}
    >
      <p style={{ color: MUTED, marginBottom: 2 }}>{point.label}</p>
      <p style={{ fontWeight: 600 }}>{formatIndicator(point.weight_kg, 1, " kg")}</p>
      <p style={{ color: point.isAnomaly ? RED : MUTED }}>
        {point.changePct == null
          ? "Primer registro"
          : `${point.changePct > 0 ? "+" : ""}${point.changePct.toFixed(1)}% vs. anterior`}
      </p>
    </div>
  );
}

function formatAxisLabel(iso: string): string {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" });
  const timePart = date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
}
