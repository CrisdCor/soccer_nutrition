"use client";

import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import { ROLE_LABELS } from "@/lib/auth/format";
import { useUserProfile } from "@/lib/auth/user-profile-context";

/**
 * Contenido del menú de cuenta (nombre, badge de rol, separador, Cerrar
 * sesión) -- compartido entre el avatar del Header (desktop/tablet) y el
 * ítem "Perfil" del BottomNav (mobile), que según el encargo deben abrir
 * "el mismo menú". Cada uno decide su propio Trigger/side; esto es solo
 * el <DropdownMenu.Content> de adentro.
 */
export function AccountMenuContent({ side = "bottom" }: { side?: "top" | "bottom" }) {
  const { full_name, role } = useUserProfile();
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <DropdownMenu.Content align="end" side={side}>
      <div className="px-2.5 py-2">
        <p className="text-sm font-medium text-foreground">{full_name}</p>
        <span className="mt-1 inline-block rounded-md border border-brand-blue-soft bg-brand-blue-soft px-2 py-0.5 text-xs font-medium text-brand-blue">
          {roleLabel}
        </span>
      </div>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onSelect={() => signOut()}>Cerrar sesión</DropdownMenu.Item>
    </DropdownMenu.Content>
  );
}
