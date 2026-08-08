import { notFound } from "next/navigation";
import { PlayerForm } from "@/components/jugadores/player-form";
import { PlayerPhotoUploader } from "@/components/jugadores/player-photo-uploader";
import { listCategories, listPositions, listRaces } from "@/lib/catalogos/queries";
import { updatePlayer } from "@/lib/jugadores/actions";
import { getPlayerById, getPlayerPhotoUrl } from "@/lib/jugadores/queries";

export default async function EditarJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [player, races, positions, categories] = await Promise.all([
    getPlayerById(id),
    listRaces(),
    listPositions({ activeOnly: true }),
    listCategories({ activeOnly: true }),
  ]);

  if (!player) {
    notFound();
  }

  const photoUrl = await getPlayerPhotoUrl(player.photo_path);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Editar jugador</h2>
        <p className="text-sm text-muted">{player.full_name}</p>
      </div>

      <PlayerPhotoUploader playerId={player.id} photoUrl={photoUrl} />

      <PlayerForm
        races={races}
        positions={positions}
        categories={categories}
        defaultValues={{
          document: player.document,
          full_name: player.full_name,
          birth_date: player.birth_date,
          sex: player.sex,
          race_id: String(player.race_id),
          position_id: player.position_id ?? "",
          category_id: player.category_id ?? "",
          home_club: player.home_club,
        }}
        action={updatePlayer.bind(null, player.id)}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
