"use client";

import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { AccountMenuContent } from "@/components/layout/account-menu-content";
import { getInitials } from "@/lib/auth/format";
import { useUserProfile } from "@/lib/auth/user-profile-context";

export function Header() {
  const { full_name } = useUserProfile();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Valoraciones antropométricas</h1>
        <p className="hidden text-xs text-muted sm:block">Independiente Medellín</p>
      </div>

      {/* En mobile el mismo menú vive en "Perfil" del BottomNav -- se
          oculta acá para no duplicar el punto de entrada. */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={`Cuenta de ${full_name}`}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground outline-none transition-colors hover:bg-brand-red-soft sm:flex"
          >
            {getInitials(full_name)}
          </button>
        </DropdownMenu.Trigger>
        <AccountMenuContent />
      </DropdownMenu.Root>
    </header>
  );
}
