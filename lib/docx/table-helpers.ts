import { BorderStyle, Paragraph, ShadingType, TableCell, TextRun, WidthType } from "docx";
import type { IBorderOptions } from "docx";
import { COLORS, FONT } from "@/lib/docx/styles";

export const THIN_BORDER: IBorderOptions = { style: BorderStyle.SINGLE, size: 2, color: COLORS.border };
export const CELL_BORDERS = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
export const CELL_MARGINS = { top: 40, bottom: 40, left: 80, right: 80 };

/**
 * Celda de una sola línea de texto -- usada por la tabla grupal y por las
 * tablas de mediciones/plan de las páginas individuales. `header` la pinta
 * de azul con texto blanco en negrita (mismo criterio que
 * lib/pdf/group-table-page.tsx); `tone` la pinta de rojo o azul suave según
 * corresponda -- "red" para fuera de rango/alto (mismo criterio que
 * RangeBadge en el dashboard), "blue" para bajo cuando la métrica distingue
 * dirección (Suma 6 Pliegues: "Óptima" en azul, no solo "no roja").
 */
export function textCell(
  text: string,
  options: { widthPct: number; header?: boolean; tone?: "red" | "blue"; bold?: boolean } = { widthPct: 0 }
): TableCell {
  const { widthPct, header = false, tone, bold = false } = options;
  const fill = header ? COLORS.blue : tone === "red" ? COLORS.redSoft : tone === "blue" ? COLORS.blueSoft : undefined;
  const textColor = header ? COLORS.white : tone === "red" ? COLORS.red : tone === "blue" ? COLORS.blue : undefined;

  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    shading: fill ? { fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            bold: header || bold,
            size: header ? 16 : 17,
            color: textColor,
          }),
        ],
      }),
    ],
  });
}
