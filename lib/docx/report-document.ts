import { Document, Paragraph, Table, TextRun, convertMillimetersToTwip } from "docx";
import { buildCoverParagraphs } from "@/lib/docx/cover";
import { buildGroupTable } from "@/lib/docx/group-table";
import { buildPlayerSectionChildren } from "@/lib/docx/player-section";
import { COLORS, FONT } from "@/lib/docx/styles";
import type { ReportDocumentData } from "@/lib/pdf/types";

// Márgenes/tamaño A4 -- mismo formato que el PDF (ver lib/pdf/cover-page.tsx
// y las demás páginas, todas `size="A4"`), aunque Word no tiene el mismo
// control de layout por página que @react-pdf/renderer.
const PAGE_MARGIN_MM = 18;

/**
 * Portada -> tabla grupal (solo modo "grupal") -> una sección por jugador --
 * mismo orden que ReportDocument en lib/pdf/report-document.tsx, reutilizando
 * exactamente los mismos datos (ReportDocumentData) que arma el Route
 * Handler para el PDF. Cada sub-builder (cover/group-table/player-section)
 * es el único lugar con lógica de layout de Word; ninguno vuelve a calcular
 * ni a consultar datos.
 */
export function buildReportDocument(data: ReportDocumentData): Document {
  const children: (Paragraph | Table)[] = [...buildCoverParagraphs(data)];

  if (data.mode === "grupal") {
    children.push(
      new Paragraph({
        pageBreakBefore: true,
        spacing: { after: 20 },
        children: [new TextRun({ text: "Reporte grupal", font: FONT, bold: true, size: 26, color: COLORS.foreground })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `${data.categoryName} · ${data.valoracionLabel} · ${data.players.length} jugadores`,
            font: FONT,
            size: 17,
            color: COLORS.muted,
          }),
        ],
      }),
      buildGroupTable(data)
    );
  }

  for (const row of data.players) {
    children.push(...buildPlayerSectionChildren(row, data));
  }

  return new Document({
    title: `Informe general - ${data.categoryName} - ${data.valoracionLabel}`,
    creator: data.generatedByName,
    // Respaldo del estilo "Normal" del documento -- cada TextRun ya pasa
    // `font: FONT` explícitamente (ver lib/docx/table-helpers.ts,
    // lib/docx/cover.ts, lib/docx/player-section.ts), pero esto cubre
    // cualquier texto que Word agregue con el estilo por defecto (p. ej.
    // saltos de línea) sin depender de que ningún run lo haya olvidado.
    styles: { default: { document: { run: { font: FONT } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
            margin: {
              top: convertMillimetersToTwip(PAGE_MARGIN_MM),
              bottom: convertMillimetersToTwip(PAGE_MARGIN_MM),
              left: convertMillimetersToTwip(PAGE_MARGIN_MM),
              right: convertMillimetersToTwip(PAGE_MARGIN_MM),
            },
          },
        },
        children,
      },
    ],
  });
}
