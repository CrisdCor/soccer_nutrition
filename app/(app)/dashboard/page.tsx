import { DashboardFilterBar } from "@/components/dashboard/filter-bar";
import { DashboardReports } from "@/components/dashboard/dashboard-reports";
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
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted">Vista general filtrable por categoría y sexo.</p>
      </div>

      <DashboardFilterBar categories={categories} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Jugadores activos" value={String(stats.playersCount)} />
        <StatCard label="Valoraciones registradas" value={String(stats.assessmentsCount)} />
        <StatCard label="AKS fuera de umbral" value={String(stats.outOfThresholdCount)} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-4 py-3 font-medium">Jugador</th>
              <th className="px-4 py-3 font-medium">Sexo</th>
              <th className="px-4 py-3 font-medium">Posición</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
            </tr>
          </thead>
          <tbody>
            {stats.players.map((player) => (
              <tr key={player.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{player.full_name}</td>
                <td className="px-4 py-3 text-muted">{player.sex}</td>
                <td className="px-4 py-3 text-muted">{player.position?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{player.category?.name ?? "—"}</td>
              </tr>
            ))}
            {stats.players.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                  No hay jugadores activos con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
