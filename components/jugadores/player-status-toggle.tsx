"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setPlayerStatus } from "@/lib/jugadores/actions";

// Client Component a propósito: arma un closure `() => setPlayerStatus(...)`
// -- si este componente fuera Server Component, ese closure se crearía en
// servidor sin estar marcado "use server", exactamente el error de
// serialización que tumbó /jugadores en producción.
//
// Sin modal de confirmación: es una acción reversible con un clic (no un
// borrado), y el propio switch ya comunica el estado resultante.

export function PlayerStatusToggle({ playerId, playerName, status }: {
  playerId: string;
  playerName: string;
  status: "active" | "inactive";
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      await setPlayerStatus(playerId, checked ? "active" : "inactive");
    });
  }

  return (
    <Switch
      checked={status === "active"}
      onCheckedChange={handleChange}
      disabled={isPending}
      aria-label={status === "active" ? `Inactivar a ${playerName}` : `Activar a ${playerName}`}
    />
  );
}
