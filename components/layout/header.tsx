"use client";

import { signOut } from "@/lib/auth/actions";
import { useUserProfile } from "@/lib/auth/user-profile-context";

export function Header() {
  const { full_name, role } = useUserProfile();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Valoraciones antropométricas</h1>
        <p className="text-xs text-muted">Independiente Medellín</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{full_name}</p>
          <span className="rounded-md border border-brand-blue-soft bg-brand-blue-soft px-2 py-0.5 text-xs font-medium text-brand-blue">
            {role}
          </span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
