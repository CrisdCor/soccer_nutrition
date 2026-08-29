import { DashboardFilterBar } from "@/components/dashboard/filter-bar";
import { DashboardReports } from "@/components/dashboard/dashboard-reports";
import { GenerateReportButton } from "@/components/dashboard/generate-report-button";
import { listCategories, listPositions } from "@/lib/catalogos/queries";
import { getCurrentThresholds } from "@/lib/configuracion/queries";
import { getDashboardStats } from "@/lib/dashboard/queries";
import { listReportAssessments, listReportPlayers } from "@/lib/dashboard/report-queries";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sex?: string }>;
}) {
  const { category, sex } = await searchParams;
  const sexFilter = sex === "Hombre" || sex === "Mujer" ? sex : undefined;

  const [stats, categories, positions, thresholds, reportPlayers, reportAssessments] = await Promise.all([
    getDashboardStats({ categoryId: category, sex: sexFilter }),
    listCategories({ activeOnly: true }),
    listPositions({ activeOnly: true }),
    getCurrentThresholds(),
    listReportPlayers(),
    listReportAssessments(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted">Vista general filtrable por categoría y sexo.</p>
        </div>
        <GenerateReportButton categories={categories} players={reportPlayers} assessments={reportAssessments} />
      </div>

      <DashboardFilterBar categories={categories} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Jugadores activos" value={String(stats.playersCount)} />
        <StatCard label="Valoraciones registradas" value={String(stats.assessmentsCount)} />
        <StatCard label="AKS fuera de umbral" value={String(stats.outOfThresholdCount)} />
      </div>

      <div>
        <h3 className="text-base font-semibold text-foreground">Visualizaciones</h3>
        <p className="text-sm text-muted">Basadas en los reportes del Excel original.</p>
      </div>

      <DashboardReports
        players={reportPlayers}
        assessments={reportAssessments}
        categories={categories}
        positions={positions}
        thresholds={thresholds}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="data mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
