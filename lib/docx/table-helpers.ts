import { BorderStyle, Paragraph, ShadingType, TableCell, TextRun, WidthType } from "docx";
import type { IBorderOptions } from "docx";
import { COLORS } from "@/lib/docx/styles";

export const THIN_BORDER: IBorderOptions = { style: BorderStyle.SINGLE, size: 2, color: COLORS.border };
export const CELL_BORDERS = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
export const CELL_MARGINS = { top: 40, bottom: 40, left: 80, right: 80 };

/**
 * Celda de una sola línea de texto -- usada por la tabla grupal y por las
 * tablas de mediciones/plan de las páginas individuales. `header` la pinta
 * de azul con texto blanco en negrita (mismo criterio que
 * lib/pdf/group-table-page.tsx); `shaded` la pinta de rojo suave con texto
 * rojo (fuera de umbral, mismo criterio que RangeBadge en pantalla).
 */
export function textCell(
  text: string,
  options: { widthPct: number; header?: boolean; shaded?: boolean; bold?: boolean } = { widthPct: 0 }
): TableCell {
  const { widthPct, header = false, shaded = false, bold = false } = options;
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: CELL_BORDERS,
    margins: CELL_MARGINS,
    shading: header
      ? { fill: COLORS.blue, type: ShadingType.CLEAR, color: "auto" }
      : shaded
        ? { fill: COLORS.redSoft, type: ShadingType.CLEAR, color: "auto" }
        : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: header || bold,
            size: header ? 16 : 17,
            color: header ? COLORS.white : shaded ? COLORS.red : undefined,
          }),
        ],
      }),
    ],
  });
}
