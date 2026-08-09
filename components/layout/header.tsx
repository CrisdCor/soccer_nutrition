"use client";

import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import { useUserProfile } from "@/lib/auth/user-profile-context";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  nutricionista: "Nutricionista",
};

function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function Header() {
  const { full_name, role } = useUserProfile();
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Valoraciones antropométricas</h1>
        <p className="text-xs text-muted">Independiente Medellín</p>
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={`Cuenta de ${full_name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground outline-none transition-colors hover:bg-brand-red-soft"
          >
            {getInitials(full_name)}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium text-foreground">{full_name}</p>
            <span className="mt-1 inline-block rounded-md border border-brand-blue-soft bg-brand-blue-soft px-2 py-0.5 text-xs font-medium text-brand-blue">
              {roleLabel}
            </span>
          </div>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onSelect={() => signOut()}>Cerrar sesión</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </header>
  );
}
