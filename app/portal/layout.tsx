import type { ReactNode } from "react";
import { PortalHeader } from "@/components/portal/portal-header";
import { UserProfileProvider } from "@/lib/auth/user-profile-context";
import { requirePlayerProfile } from "@/lib/portal/session";
import { signOut } from "@/lib/auth/actions";

/**
 * Shell del Portal del Jugador: header simple (sin sidebar, sin
 * BottomNav de 4 ítems de staff) + <main> a pantalla completa. Separado
 * de app/(app)/layout.tsx a propósito -- ese layout asume un usuario de
 * staff (Sidebar, BottomNav con lógica de rol admin/nutricionista) y
 * redirige a role='jugador' hacia acá (ver la redirección en ese
 * layout); duplicar un layout completo es más simple y explícito que
 * meter un branch de rol dentro del layout de staff.
 */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { profile, playerId } = await requirePlayerProfile();

  if (!playerId) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-sm font-medium text-foreground">Tu cuenta todavía no está vinculada a un jugador.</p>
          <p className="text-sm text-muted">Pide a tu nutricionista que revise tu usuario.</p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <UserProfileProvider profile={profile}>
      <div className="flex h-dvh min-h-dvh flex-col overflow-x-hidden">
        <PortalHeader fullName={profile.full_name} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </UserProfileProvider>
  );
}
