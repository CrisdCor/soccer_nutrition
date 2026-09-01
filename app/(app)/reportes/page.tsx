import { ReportForm } from "@/components/reportes/report-form";
import { listCategories } from "@/lib/catalogos/queries";
import { listReportAssessments, listReportPlayers } from "@/lib/dashboard/report-queries";

// Antes era un botón "Generar reporte" dentro del Dashboard (Sheet lateral);
// ahora es su propia pantalla con ítem propio en el sidebar/BottomNav (ver
// components/layout/sidebar.tsx). Mismos datos que ya pedía el Dashboard
// para esto -- listReportPlayers/listReportAssessments, reutilizados tal
// cual, sin duplicar la consulta.
export default async function ReportesPage() {
  const [categories, players, assessments] = await Promise.all([
    listCategories({ activeOnly: true }),
    listReportPlayers(),
    listReportAssessments(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Reportes</h2>
        <p className="text-sm text-muted">Informe general en PDF o Word, grupal o de un jugador puntual.</p>
      </div>

      <ReportForm categories={categories} players={players} assessments={assessments} />
    </div>
  );
}
