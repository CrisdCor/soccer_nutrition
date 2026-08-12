import Image from "next/image";
import { signOut } from "@/lib/auth/actions";

/**
 * Header del Portal del Jugador -- sin sidebar, sin dropdown de cuenta con
 * links a otros módulos (AccountMenuContent es de staff): solo la marca y
 * un botón directo de cerrar sesión. Server Component -- <form
 * action={signOut}> con una Server Action funciona sin "use client", mismo
 * patrón que el estado de error de app/(app)/layout.tsx.
 */
export function PortalHeader({ fullName }: { fullName: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Image src="/logo.webp" alt="" width={28} height={28} className="shrink-0" aria-hidden />
        <div className="leading-tight">
          <p className="text-xs font-semibold tracking-tight text-foreground">Nutrición Fuerzas Básicas</p>
          <p className="text-xs text-muted">{fullName}</p>
        </div>
      </div>

      <form action={signOut}>
        <button type="submit" className="btn-secondary">
          Cerrar sesión
        </button>
      </form>
    </header>
  );
}
