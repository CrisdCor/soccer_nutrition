import { Table, TableRow, WidthType } from "docx";
import { computeDisplayAge } from "@/lib/calculations";
import { classifyByThreshold, formatIndicator, formatPercentage, type ThresholdRange } from "@/lib/format";
import { textCell } from "@/lib/docx/table-helpers";
import type { ReportDocumentData, ReportPlayerData } from "@/lib/pdf/types";

// Mismos anchos relativos que lib/pdf/group-table-page.tsx (suman 100).
const COLUMN_WIDTHS = {
  position: 13,
  name: 22,
  age: 8,
  height: 10,
  weight: 10,
  musclePct: 13,
  skinfoldSum: 12,
  aks: 12,
};

/**
 * Tabla grupal del reporte de Word (modo "grupal" únicamente): mismas
 * columnas y mismo criterio de color de celda por umbral configurado que la
 * página 2 del PDF (ver lib/pdf/group-table-page.tsx) -- Word soporta
 * `shading` de celda nativo, así que no hace falta ningún workaround.
 */
export function buildGroupTable(data: ReportDocumentData): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell("Posición", { widthPct: COLUMN_WIDTHS.position, header: true }),
      textCell("Nombre", { widthPct: COLUMN_WIDTHS.name, header: true }),
      textCell("Edad", { widthPct: COLUMN_WIDTHS.age, header: true }),
      textCell("Talla", { widthPct: COLUMN_WIDTHS.height, header: true }),
      textCell("Peso", { widthPct: COLUMN_WIDTHS.weight, header: true }),
      textCell("% M. Muscular", { widthPct: COLUMN_WIDTHS.musclePct, header: true }),
      textCell("Suma 6 Pliegues", { widthPct: COLUMN_WIDTHS.skinfoldSum, header: true }),
      textCell("Índice AKS", { widthPct: COLUMN_WIDTHS.aks, header: true }),
    ],
  });

  const rows = data.players.map((row) => buildPlayerRow(row, data.thresholds));

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] });
}

function buildPlayerRow(row: ReportPlayerData, thresholds: ReportDocumentData["thresholds"]): TableRow {
  const { player, assessment } = row;
  const age = computeDisplayAge(new Date(player.birth_date), new Date(assessment.assessment_date));
  const skinfoldOut = isOutOfRange(assessment.skinfold_sum_6, thresholds.skinfold_sum);
  const aksOut = isOutOfRange(assessment.aks_index, thresholds.aks_index);

  return new TableRow({
    children: [
      textCell(player.position?.name ?? "—", { widthPct: COLUMN_WIDTHS.position }),
      textCell(player.full_name, { widthPct: COLUMN_WIDTHS.name }),
      textCell(String(age), { widthPct: COLUMN_WIDTHS.age }),
      textCell(formatIndicator(assessment.height_cm, 1, " cm"), { widthPct: COLUMN_WIDTHS.height }),
      textCell(formatIndicator(assessment.weight_kg, 1, " kg"), { widthPct: COLUMN_WIDTHS.weight }),
      textCell(formatPercentage(assessment.muscle_percentage), { widthPct: COLUMN_WIDTHS.musclePct }),
      textCell(formatIndicator(assessment.skinfold_sum_6, 1, " mm"), {
        widthPct: COLUMN_WIDTHS.skinfoldSum,
        shaded: skinfoldOut,
      }),
      textCell(formatIndicator(assessment.aks_index, 2), { widthPct: COLUMN_WIDTHS.aks, shaded: aksOut }),
    ],
  });
}

function isOutOfRange(value: number | null, threshold: ThresholdRange | null): boolean {
  const classification = classifyByThreshold(value, threshold);
  return classification != null && classification !== "normal";
}
