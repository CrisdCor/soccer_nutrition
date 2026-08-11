"use client";

import Link from "next/link";
import { useState } from "react";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { ResetPasswordModal } from "@/components/usuarios/reset-password-modal";

/**
 * "•••" con Editar + Restablecer contraseña -- mismo patrón que
 * PlayerActionsMenu (Editar en el menú, Activar/Inactivar aparte porque un
 * Switch no compone bien en un DropdownMenu.Item). Sin gating de rol: a
 * diferencia de /jugadores, /usuarios ya es una ruta admin-only a nivel de
 * proxy.ts, así que quien ve esta tabla siempre es admin.
 */
export function UserActionsMenu({ userId, userName }: { userId: string; userName: string }) {
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className="btn-secondary" aria-label={`Más acciones para ${userName}`}>
            •••
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item asChild>
            <Link href={`/usuarios/${userId}/editar`}>Editar</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setResetOpen(true)}>Restablecer contraseña</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <ResetPasswordModal userId={userId} userName={userName} open={resetOpen} onOpenChange={setResetOpen} />
    </>
  );
}
