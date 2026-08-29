import type { ThresholdRange } from "@/lib/format";
import type { PlayerAksHistoryPoint } from "@/lib/reportes/queries";

export type AksChartDimensions = {
  width: number;
  height: number;
  axisLabelHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
};

// Mismas dimensiones para los dos renderers -- ver lib/pdf/aks-evolution-chart.tsx
// (primitivas SVG nativas de @react-pdf/renderer) y lib/docx/aks-chart-image.ts
// (SVG estático rasterizado a PNG), para que el gráfico se vea igual de
// grande/proporcionado en los dos formatos.
export const DEFAULT_AKS_CHART_DIMENSIONS: AksChartDimensions = {
  width: 480,
  height: 150,
  axisLabelHeight: 20,
  padding: { top: 16, right: 14, bottom: 22, left: 26 },
};

export type AksChartPoint = { x: number; y: number };
export type AksChartDataPoint = { id: string; x: number; y: number; isCurrent: boolean };
export type AksChartLabel = {
  id: string;
  x: number;
  text: string;
  isCurrent: boolean;
  /** El primer y último punto quedan pegados al borde del gráfico -- si se
   *  centraran igual que los del medio, el texto se saldría del área
   *  dibujable y quedaría cortado. "start"/"end" ancla el texto hacia
   *  adentro en esos dos casos; "middle" (el resto) centra como siempre. */
  anchor: "start" | "middle" | "end";
};
export type AksChartThresholdLine = { y: number; label: string };

export type AksChartGeometry = {
  dimensions: AksChartDimensions;
  axisY: number;
  /** Un tramo por corrida contigua de valoraciones con AKS calculado --
   *  una valoración sin AKS corta la línea en vez de interpolar entre las
   *  vecinas (igual que connectNulls=false en el Dashboard). */
  segments: AksChartPoint[][];
  dataPoints: AksChartDataPoint[];
  xLabels: AksChartLabel[];
  thresholdLines: { high: AksChartThresholdLine; low: AksChartThresholdLine } | null;
};

/**
 * Matemática pura (escalas, segmentos, coordenadas) del gráfico de
 * evolución de Índice AKS -- compartida por los dos renderers de reporte
 * (PDF y Word) para que ninguno de los dos vuelva a calcular esto por su
 * cuenta, solo dibuje el resultado con sus propias primitivas. Mismo
 * criterio que el gráfico "Evolución -- Índice AKS" de PlayerSummaryReport
 * en el Dashboard: líneas de referencia del umbral configurado, sin
 * interpolar valoraciones sin AKS calculado.
 *
 * null cuando no hay ningún valor (ni de AKS ni de umbral) para escalar el
 * eje Y -- no debería pasar en la práctica (los dos callers ya exigen
 * history.length > 1 antes de invocar esto), pero evita un NaN si algún
 * día sí pasa.
 */
export function buildAksChartGeometry(
  history: PlayerAksHistoryPoint[],
  currentAssessmentId: string,
  threshold: ThresholdRange | null,
  dimensions: AksChartDimensions = DEFAULT_AKS_CHART_DIMENSIONS
): AksChartGeometry | null {
  const values = history.map((point) => point.aks_index).filter((value): value is number => value != null);
  const thresholdValues = threshold ? [threshold.low_cut, threshold.high_cut] : [];
  const allValues = [...values, ...thresholdValues];
  if (allValues.length === 0) return null;

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  // Margen del 12% para que puntos y líneas de referencia no queden pegados
  // al borde del gráfico.
  const span = rawMax - rawMin || 1;
  const yMin = rawMin - span * 0.12;
  const yMax = rawMax + span * 0.12;

  const { width, height, padding } = dimensions;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const axisY = padding.top + innerHeight;

  const xAt = (index: number) =>
    history.length > 1 ? padding.left + (index * innerWidth) / (history.length - 1) : padding.left + innerWidth / 2;
  const yAt = (value: number) => padding.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

  const segments: AksChartPoint[][] = [];
  const dataPoints: AksChartDataPoint[] = [];
  let current: AksChartPoint[] = [];
  history.forEach((point, index) => {
    if (point.aks_index == null) {
      if (current.length > 0) segments.push(current);
      current = [];
      return;
    }
    const coords = { x: xAt(index), y: yAt(point.aks_index) };
    current.push(coords);
    dataPoints.push({ id: point.id, ...coords, isCurrent: point.id === currentAssessmentId });
  });
  if (current.length > 0) segments.push(current);

  const xLabels: AksChartLabel[] = history.map((point, index) => ({
    id: point.id,
    x: xAt(index),
    text: point.label,
    isCurrent: point.id === currentAssessmentId,
    anchor:
      history.length <= 1
        ? "middle"
        : index === 0
          ? "start"
          : index === history.length - 1
            ? "end"
            : "middle",
  }));

  const thresholdLines = threshold
    ? {
        high: { y: yAt(threshold.high_cut), label: `Máx ${threshold.high_cut}` },
        low: { y: yAt(threshold.low_cut), label: `Mín ${threshold.low_cut}` },
      }
    : null;

  return { dimensions, axisY, segments, dataPoints, xLabels, thresholdLines };
}
