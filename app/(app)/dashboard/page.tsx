export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted">
          Scaffold inicial. Los módulos del MVP (Jugadores, Valoraciones, Catálogos,
          Configuración, Usuarios) se construyen en los siguientes pasos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Jugadores activos" value="—" />
        <StatCard label="Valoraciones registradas" value="—" />
        <StatCard label="AKS fuera de umbral" value="—" />
      </div>
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
