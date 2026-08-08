import { notFound } from "next/navigation";
import { PlayerActionsMenu } from "@/components/jugadores/player-actions-menu";
import { PlayerAssessmentsTabs } from "@/components/jugadores/player-assessments-tabs";
import { PlayerPhotoUploader } from "@/components/jugadores/player-photo-uploader";
import { computeDisplayAge } from "@/lib/calculations";
import { getCurrentThresholds } from "@/lib/configuracion/queries";
import { getPlayerById, getPlayerPhotoUrl } from "@/lib/jugadores/queries";
import { listAssessmentsByPlayer } from "@/lib/valoraciones/queries";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, assessments, thresholds] = await Promise.all([
    getPlayerById(id),
    listAssessmentsByPlayer(id),
    getCurrentThresholds(),
  ]);

  if (!player) {
    notFound();
  }

  const photoUrl = await getPlayerPhotoUrl(player.photo_path);
  const age = computeDisplayAge(new Date(player.birth_date));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <PlayerPhotoUploader playerId={player.id} photoUrl={photoUrl} />
          <div>
            <h2 className="text-lg font-semibold text-foreground">{player.full_name}</h2>
            <p className="data text-sm text-muted">{player.document}</p>
          </div>
        </div>
        <PlayerActionsMenu playerId={player.id} playerName={player.full_name} status={player.status} />
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

      <PlayerAssessmentsTabs
        playerId={player.id}
        playerName={player.full_name}
        playerDocument={player.document}
        photoUrl={photoUrl}
        assessments={assessments}
        thresholds={thresholds}
      />
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
