import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { UserProfileProvider } from "@/lib/auth/user-profile-context";

// Shell de las rutas autenticadas: sidebar + header + <main>. El middleware
// ya garantiza que solo se llega aquí con sesión, pero se vuelve a comprobar
// (defensa en profundidad) y se resuelve el perfil una sola vez en servidor
// para pasarlo al UserProfileProvider.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, organization_id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // El usuario existe en auth.users pero no tiene fila en user_profiles
    // (el trigger no corrió, o se creó a mano sin completarla). No
    // redirigimos a /login: con sesión válida el middleware rebotaría de
    // vuelta a /dashboard y entraríamos en loop. Mostramos el problema y
    // dejamos cerrar sesión explícitamente.
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Tu usuario no tiene un perfil configurado.
          </p>
          <p className="text-sm text-muted">
            Pide a un administrador que revise tu fila en{" "}
            <code className="data">user_profiles</code>.
          </p>
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
      <div className="flex h-full min-h-full">
        <Sidebar />
        <div className="flex min-h-full flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </UserProfileProvider>
  );
}
