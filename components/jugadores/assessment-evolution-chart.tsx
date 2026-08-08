"use client";

import type { ReactNode } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartPoint = {
  date: string;
  weightKg: number | null;
  fatPercentage: number | null;
};

// Colores explícitos (rojo/azul institucionales, neutros) — nunca verde,
// ni siquiera el default de recharts, siguiendo el design system.
export function AssessmentEvolutionChart({ points }: { points: ChartPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
        Se necesitan al menos 2 valoraciones para mostrar la evolución.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ChartCard title="Peso (kg)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted)" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted)" }}
              domain={["auto", "auto"]}
              width={36}
            />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="weightKg"
              stroke="var(--color-brand-red)"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="% Masa grasa">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted)" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted)" }}
              domain={["auto", "auto"]}
              width={36}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
            />
            <Line
              type="monotone"
              dataKey="fatPercentage"
              stroke="var(--color-brand-blue)"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-2 text-xs text-muted">{title}</p>
      {children}
    </div>
  );
}
