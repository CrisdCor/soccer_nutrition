import { classifyByThreshold, type ThresholdRange } from "@/lib/format";

/**
 * "Fuera de rango" en rojo (badge, nunca relleno completo de fila/celda);
 * dentro de rango = sin badge -- ausencia de color comunica "está bien",
 * mismo principio que el resto del Design System (verde prohibido incluso
 * para estados de éxito). Sin umbral configurado: tampoco se muestra nada.
 */
export function RangeBadge({
  value,
  threshold,
}: {
  value: number | null;
  threshold: ThresholdRange | null;
}) {
  const classification = classifyByThreshold(value, threshold);
  if (classification == null || classification === "normal") return null;

  return (
    <span className="ml-2 inline-block whitespace-nowrap rounded border border-brand-red bg-brand-red-soft px-1.5 py-0.5 text-[10px] font-medium text-brand-red">
      Fuera de rango
    </span>
  );
}
