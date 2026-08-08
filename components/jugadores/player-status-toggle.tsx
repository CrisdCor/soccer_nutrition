import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { setPlayerStatus } from "@/lib/jugadores/actions";

export function PlayerStatusToggle({ playerId, playerName, status }: {
  playerId: string;
  playerName: string;
  status: "active" | "inactive";
}) {
  if (status === "active") {
    return (
      <ConfirmActionButton
        label="Inactivar"
        confirmTitle="Inactivar jugador"
        confirmDescription={`¿Inactivar a ${playerName}? Dejará de aparecer en el listado de jugadores activos. No se borra ningún dato: se puede reactivar después.`}
        confirmLabel="Inactivar"
        action={() => setPlayerStatus(playerId, "inactive")}
      />
    );
  }

  return (
    <form action={setPlayerStatus.bind(null, playerId, "active")}>
      <button type="submit" className="btn-secondary">
        Activar
      </button>
    </form>
  );
}
