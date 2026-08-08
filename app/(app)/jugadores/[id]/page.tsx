import Link from "next/link";
import { notFound } from "next/navigation";
import { AssessmentEvolutionChart } from "@/components/jugadores/assessment-evolution-chart";
import { PlayerAssessmentsTable } from "@/components/jugadores/player-assessments-table";
import { computeDisplayAge } from "@/lib/calculations";
import { getPlayerById } from "@/lib/jugadores/queries";
import { setPlayerStatus } from "@/lib/jugadores/actions";
import { listAssessmentsByPlayer } from "@/lib/valoraciones/queries";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, assessments] = await Promise.all([
    getPlayerById(id),
    listAssessmentsByPlayer(id),
  ]);

  if (!player) {
    notFound();
  }

  const age = computeDisplayAge(new Date(player.birth_date));
  const chartPoints = assessments.map((a) => ({
    date: a.assessment_date,
    weightKg: a.weight_kg,
    fatPercentage: a.fat_percentage != null ? a.fat_percentage * 100 : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{player.full_name}</h2>
          <p className="data text-sm text-muted">{player.document}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/jugadores/${player.id}/editar`} className="btn-secondary">
            Editar
          </Link>
          <form
            action={setPlayerStatus.bind(
              null,
              player.id,
              player.status === "active" ? "inactive" : "active"
            )}
          >
            <button type="submit" className="btn-secondary">
              {player.status === "active" ? "Inactivar" : "Activar"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Edad" value={`${age}`} />
        <InfoCard label="Sexo" value={player.sex} />
        <InfoCard label="Posición" value={player.position?.name ?? "—"} />
        <InfoCard label="Categoría" value={player.category?.name ?? "—"} />
        <InfoCard label="Raza" value={player.race?.name ?? "—"} />
        <InfoCard label="Cantera" value={player.home_club ? "Sí" : "No"} />
        <InfoCard label="Estado" value={player.status === "active" ? "Activo" : "Inactivo"} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Valoraciones</h3>
          <Link href={`/jugadores/${player.id}/valoraciones/nueva`} className="btn-primary">
            Nueva valoración
          </Link>
        </div>

        <AssessmentEvolutionChart points={chartPoints} />
        <PlayerAssessmentsTable assessments={assessments} />
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="data mt-1 text-base font-medium text-foreground">{value}</p>
    </div>
  );
}
