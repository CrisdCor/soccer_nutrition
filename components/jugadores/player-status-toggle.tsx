"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setPlayerStatus } from "@/lib/jugadores/actions";
import { useUserProfile } from "@/lib/auth/user-profile-context";

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
  const { role } = useUserProfile();
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      await setPlayerStatus(playerId, checked ? "active" : "inactive");
    });
  }

  // lider ve el estado (es contenido informativo) pero no el control
  // interactivo -- la escritura ya está bloqueada por RLS, esto solo evita
  // mostrar un switch que fallaría al accionarlo.
  if (role === "lider") {
    return <span className="text-sm text-muted">{status === "active" ? "Activo" : "Inactivo"}</span>;
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
