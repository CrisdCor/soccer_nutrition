import sharp from "sharp";
import type { ThresholdRange } from "@/lib/format";
import { buildAksChartGeometry } from "@/lib/reportes/aks-chart-model";
import type { PlayerAksHistoryPoint } from "@/lib/reportes/queries";
import { COLORS } from "@/lib/docx/styles";

// Doble resolución para que el PNG se vea nítido al tamaño en que se
// inserta en el documento (mismas dimensiones lógicas que declara el SVG,
// ver ImageRun.transformation en player-section.ts) -- mismo criterio que
// las fotos de jugador/escudo (sharp normaliza a PNG antes de embeber).
const RASTER_DENSITY = 192;

export type AksChartPng = { buffer: Buffer; width: number; height: number };

/**
 * Word no soporta dibujar vectores como @react-pdf/renderer -- el mismo
 * gráfico "Evolución -- Índice AKS" del PDF individual (ver
 * lib/pdf/aks-evolution-chart.tsx) se genera acá como un SVG estático y se
 * rasteriza a PNG con sharp para insertarlo como imagen (ImageRun). La
 * matemática (escalas, segmentos, coordenadas) es la misma de los dos
 * renderers -- lib/reportes/aks-chart-model.ts -- así que el gráfico se ve
 * igual de proporcionado en los dos formatos, solo cambia cómo se pinta.
 *
 * null cuando no hay nada que graficar (ver buildAksChartGeometry) -- el
 * caller (player-section.ts) ya exige history.length > 1 antes de llamar
 * esto, pero se propaga el null igual por si acaso.
 */
export async function buildAksChartPng(
  history: PlayerAksHistoryPoint[],
  currentAssessmentId: string,
  threshold: ThresholdRange | null
): Promise<AksChartPng | null> {
  const geometry = buildAksChartGeometry(history, currentAssessmentId, threshold);
  if (!geometry) return null;

  const { dimensions, axisY, segments, dataPoints, xLabels, thresholdLines } = geometry;
  const { width, height, axisLabelHeight, padding } = dimensions;
  const totalHeight = height + axisLabelHeight;

  const RED = `#${COLORS.red}`;
  const BLUE = `#${COLORS.blue}`;
  const BORDER = `#${COLORS.border}`;
  const MUTED = `#${COLORS.muted}`;

  const elements: string[] = [];

  elements.push(line(padding.left, axisY, width - padding.right, axisY, BORDER, 1));

  if (thresholdLines) {
    elements.push(line(padding.left, thresholdLines.high.y, width - padding.right, thresholdLines.high.y, BLUE, 0.75, "3 3"));
    elements.push(line(padding.left, thresholdLines.low.y, width - padding.right, thresholdLines.low.y, BLUE, 0.75, "3 3"));
  }

  for (const segment of segments) {
    const points = segment.map((point) => `${point.x},${point.y}`).join(" ");
    elements.push(`<polyline points="${points}" fill="none" stroke="${RED}" stroke-width="1.5" />`);
  }

  for (const point of dataPoints) {
    const radius = point.isCurrent ? 3.2 : 2.2;
    elements.push(`<circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${point.isCurrent ? BLUE : RED}" />`);
  }

  if (thresholdLines) {
    elements.push(text(padding.left, thresholdLines.high.y - 3, thresholdLines.high.label, BLUE, "start"));
    elements.push(text(padding.left, thresholdLines.low.y + 9, thresholdLines.low.label, BLUE, "start"));
  }

  for (const label of xLabels) {
    elements.push(text(label.x, height + axisLabelHeight - 8, label.text, label.isCurrent ? BLUE : MUTED, label.anchor));
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" font-family="Helvetica, Arial, sans-serif" font-size="6">${elements.join("")}</svg>`;

  const buffer = await sharp(Buffer.from(svg), { density: RASTER_DENSITY }).png().toBuffer();
  return { buffer, width, height: totalHeight };
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, strokeWidth: number, dasharray?: string): string {
  const dash = dasharray ? ` stroke-dasharray="${dasharray}"` : "";
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}"${dash} />`;
}

function text(x: number, y: number, value: string, fill: string, anchor: "start" | "middle" | "end"): string {
  return `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}">${escapeXml(value)}</text>`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
