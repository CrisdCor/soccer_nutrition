"use client";

import Link from "next/link";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { setPlayerStatus } from "@/lib/jugadores/actions";

/**
 * Agrupa Editar/Inactivar en un menú "•••" para no saturar la card de datos
 * del jugador con botones sueltos (esto va a crecer con el Plan de
 * Alimentación). "Nueva valoración" queda fuera, visible aparte, por ser la
 * acción más frecuente.
 */
export function PlayerActionsMenu({
  playerId,
  playerName,
  status,
}: {
  playerId: string;
  playerName: string;
  status: "active" | "inactive";
}) {
  const { requestConfirm, dialog } = useConfirmDialog();

  function handleToggleStatus() {
    if (status === "active") {
      requestConfirm({
        title: "Inactivar jugador",
        description: `¿Inactivar a ${playerName}? Dejará de aparecer en el listado de jugadores activos. No se borra ningún dato: se puede reactivar después.`,
        confirmLabel: "Inactivar",
        action: () => setPlayerStatus(playerId, "inactive"),
      });
    } else {
      // Reactivar no tiene consecuencia real: no pide confirmación.
      void setPlayerStatus(playerId, "active");
    }
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className="btn-secondary" aria-label="Más acciones">
            •••
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item asChild>
            <Link href={`/jugadores/${playerId}/editar`}>Editar</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={handleToggleStatus}>
            {status === "active" ? "Inactivar" : "Activar"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {dialog}
    </>
  );
}
