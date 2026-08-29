import { AlignmentType, ImageRun, Paragraph, TextRun } from "docx";
import { dataUriToBuffer } from "@/lib/docx/image-utils";
import { COLORS } from "@/lib/docx/styles";
import type { ReportDocumentData } from "@/lib/pdf/types";

/**
 * Portada del documento Word: escudo (si hay), título, subtítulo, contexto
 * (categoría/jugador + valoración) y nombre/cargo de quien generó el
 * reporte. Sin las franjas decorativas diagonales de la portada del PDF
 * (ver lib/pdf/cover-page.tsx) -- fidelidad de contenido e información, no
 * pixel a pixel (pedido explícito del usuario para esta entrega).
 */
export function buildCoverParagraphs(data: ReportDocumentData): Paragraph[] {
  const shieldBuffer = dataUriToBuffer(data.shieldDataUri);
  const paragraphs: Paragraph[] = [];

  if (shieldBuffer) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 240 },
        children: [new ImageRun({ type: "png", data: shieldBuffer, transformation: { width: 110, height: 110 } })],
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: shieldBuffer ? 0 : 1400, after: 80 },
      children: [new TextRun({ text: "INFORME GENERAL", bold: true, size: 52, color: COLORS.blue })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [new TextRun({ text: "FUERZAS BÁSICAS", bold: true, size: 26, color: COLORS.red })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: `${data.categoryName} · ${data.valoracionLabel}`, size: 20, color: COLORS.muted })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [new TextRun({ text: data.generatedByName, bold: true, size: 22 })],
    })
  );

  if (data.generatedByRoleTitle) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: data.generatedByRoleTitle, size: 18, color: COLORS.muted })],
      })
    );
  }

  return paragraphs;
}
