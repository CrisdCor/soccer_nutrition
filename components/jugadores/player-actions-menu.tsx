"use client";

import Link from "next/link";
import * as DropdownMenu from "@/components/ui/dropdown-menu";

/**
 * "Editar" en un menú "•••" -- el toggle Activar/Inactivar salió de acá
 * (ver PlayerStatusToggle, ahora en el encabezado del perfil junto a este
 * menú): un Switch no compone bien dentro de un DropdownMenu.Item, que
 * cierra el menú al seleccionarse.
 */
export function PlayerActionsMenu({ playerId }: { playerId: string }) {
  return (
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
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
