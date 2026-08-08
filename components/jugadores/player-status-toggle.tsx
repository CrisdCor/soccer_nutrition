"use client";

import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { setPlayerStatus } from "@/lib/jugadores/actions";

// Client Component a propósito: arma un closure `() => setPlayerStatus(...)`
// para pasárselo a ConfirmActionButton (también "use client"). Si este
// componente fuera Server Component, ese closure se crearía en servidor sin
// estar marcado "use server" -- exactamente el error de serialización que
// tumbó /jugadores en producción.

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
