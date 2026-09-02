import type { ReactNode } from "react";

export function InfoGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </div>
  );
}

export function InfoItem({
  label,
  value,
  valueClassName = "text-foreground",
}: {
  label: string;
  value: string;
  /** Override puntual del color del valor (ej. clasificación de %Grasa) -- por defecto el texto neutro de siempre. */
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`data mt-1 text-sm font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}
