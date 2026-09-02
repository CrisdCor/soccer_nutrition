/**
 * Formatea un indicador calculado. Un valor null significa que falta algún
 * dato de entrada para calcularlo -- nunca se muestra como "0" (eso
 * implicaría un valor real de cero). Se deja vacío en vez de un texto tipo
 * "Dato insuficiente": un guion simple si el layout lo necesita para no
 * verse roto (ver los `?? "—"` puntuales en toda la app), texto vacío si no.
 */
export function formatIndicator(value: number | null, decimals = 2, suffix = ""): string {
  if (value == null) return "";
  return `${value.toFixed(decimals)}${suffix}`;
}

export function formatPercentage(value: number | null, decimals = 1): string {
  if (value == null) return "";
  return `${(value * 100).toFixed(decimals)}%`;
}

export type ThresholdRange = { low_cut: number; high_cut: number };
export type ThresholdClassification = "bajo" | "normal" | "alto";

/**
 * Clasifica un valor contra un umbral configurable (reference_thresholds).
 * 3 niveles siempre (bajo/normal/alto) -- lo que cambia según la métrica es
 * cómo se etiquetan y colorean esos 3 niveles (ver formatClassification vs.
 * formatSkinfoldSumClassification/formatFatPercentageClassification más
 * abajo), no la clasificación en sí.
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

/**
 * Índice AKS únicamente -- criterio original sin cambios: "bajo" y "alto"
 * se tratan igual (ambos "fuera de rango", ver RangeBadge en el dashboard),
 * sin distinguir dirección con color.
 */
export function formatClassification(classification: ThresholdClassification | null): string {
  if (classification == null) return "Sin umbral configurado";
  return { bajo: "Bajo", normal: "Normal", alto: "Alto" }[classification];
}

/**
 * Suma 6 Pliegues: <low_cut Óptima (azul), low_cut–high_cut Aceptable (sin
 * color), >high_cut Alta (roja) -- a diferencia de AKS, acá "bajo" y "alto"
 * sí se distinguen (uno es positivo, el otro negativo).
 */
export function formatSkinfoldSumClassification(classification: ThresholdClassification | null): string {
  if (classification == null) return "Sin umbral configurado";
  return { bajo: "Óptima", normal: "Aceptable", alto: "Alta" }[classification];
}

/** % de Grasa (Yuhasz): mismo criterio de 3 niveles que Suma 6 Pliegues, con umbral propio (`fat_percentage`) y etiquetas en masculino. */
export function formatFatPercentageClassification(classification: ThresholdClassification | null): string {
  if (classification == null) return "Sin umbral configurado";
  return { bajo: "Óptimo", normal: "Aceptable", alto: "Alto" }[classification];
}
