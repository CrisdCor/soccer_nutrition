/**
 * Formatea un indicador calculado. Un valor null significa "dato
 * insuficiente" (no 0) — así debe mostrarse siempre, nunca como "0".
 */
export function formatIndicator(value: number | null, decimals = 2, suffix = ""): string {
  if (value == null) return "Dato insuficiente";
  return `${value.toFixed(decimals)}${suffix}`;
}

export function formatPercentage(value: number | null, decimals = 1): string {
  if (value == null) return "Dato insuficiente";
  return `${(value * 100).toFixed(decimals)}%`;
}

export type ThresholdRange = { low_cut: number; high_cut: number };
export type ThresholdClassification = "bajo" | "normal" | "alto";

/**
 * Clasifica un valor contra un umbral configurable (reference_thresholds).
 * Se usa tal cual para AKS, y también para %Grasa (Yuhasz): como %Grasa se
 * deriva monótonamente de la Suma 6 Pliegues, clasificar por el umbral de
 * 'skinfold_sum' contra skinfold_sum_6 equivale a clasificar el %Grasa —
 * no hay (ni se necesita) un umbral separado para el porcentaje.
 */
export function classifyByThreshold(
  value: number | null,
  threshold: ThresholdRange | null
): ThresholdClassification | null {
  if (value == null || threshold == null) return null;
  if (value < threshold.low_cut) return "bajo";
  if (value > threshold.high_cut) return "alto";
  return "normal";
}

export function formatClassification(classification: ThresholdClassification | null): string {
  if (classification == null) return "Sin umbral configurado";
  return { bajo: "Bajo", normal: "Normal", alto: "Alto" }[classification];
}
