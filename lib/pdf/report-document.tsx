import { Document } from "@react-pdf/renderer";
import { CoverPage } from "@/lib/pdf/cover-page";
import { GroupTablePage } from "@/lib/pdf/group-table-page";
import { PlayerPage } from "@/lib/pdf/player-page";
import type { ReportDocumentData } from "@/lib/pdf/types";

/**
 * Portada -> tabla grupal -> una página (o más, ver PlayerPage) por
 * jugador. La página de hallazgos automáticos del ejemplo de referencia
 * queda fuera de esta entrega (ver AGENTS.md / handoff del feature).
 */
export function ReportDocument({ data }: { data: ReportDocumentData }) {
  return (
    <Document
      title={`Informe general - ${data.categoryName} - ${data.valoracionLabel}`}
      author={data.generatedByName}
    >
      <CoverPage data={data} />
      <GroupTablePage data={data} />
      {data.players.map((row) => (
        <PlayerPage key={row.player.id} row={row} data={data} />
      ))}
    </Document>
  );
}
