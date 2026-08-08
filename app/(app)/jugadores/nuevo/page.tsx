import { PlayerForm } from "@/components/jugadores/player-form";
import { listCategories, listPositions, listRaces } from "@/lib/catalogos/queries";
import { createPlayer } from "@/lib/jugadores/actions";

export default async function NuevoJugadorPage() {
  const [races, positions, categories] = await Promise.all([
    listRaces(),
    listPositions({ activeOnly: true }),
    listCategories({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Nuevo jugador</h2>
        <p className="text-sm text-muted">El documento debe ser único dentro de la organización.</p>
      </div>

      <PlayerForm
        races={races}
        positions={positions}
        categories={categories}
        action={createPlayer}
        submitLabel="Crear jugador"
      />
    </div>
  );
}
