import { classifyByThreshold, type ThresholdRange } from "@/lib/format";

/**
 * Variante de 3 niveles de RangeBadge -- a diferencia de esa (que trata todo
 * lo fuera de rango igual, en rojo, para AKS sin cambios), acá "bajo" y
 * "alto" se distinguen: azul (positivo) para bajo, rojo (negativo) para
 * alto, sin badge para "normal" (mismo principio de ausencia de color =
 * está bien). Usado por Suma 6 Pliegues -- ver lib/format.ts para las
 * clasificaciones/etiquetas por métrica.
 */
export function ThreeLevelBadge({
  value,
  threshold,
  lowLabel,
  highLabel,
}: {
  value: number | null;
  threshold: ThresholdRange | null;
  lowLabel: string;
  highLabel: string;
}) {
  const classification = classifyByThreshold(value, threshold);
  if (classification == null || classification === "normal") return null;

  if (classification === "bajo") {
    return (
      <span className="ml-2 inline-block whitespace-nowrap rounded border border-brand-blue-soft bg-brand-blue-soft px-1.5 py-0.5 text-[10px] font-medium text-brand-blue">
        {lowLabel}
      </span>
    );
  }

  return (
    <span className="ml-2 inline-block whitespace-nowrap rounded border border-brand-red bg-brand-red-soft px-1.5 py-0.5 text-[10px] font-medium text-brand-red">
      {highLabel}
    </span>
  );
}
