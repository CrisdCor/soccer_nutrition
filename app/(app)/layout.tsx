import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
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

  // role='jugador' tiene su propio shell (app/portal/layout.tsx): sin
  // sidebar/BottomNav de staff, solo su propio estado y plan. Cubre TODAS
  // las rutas bajo este layout de una sola vez (a diferencia de proxy.ts,
  // que solo bloquea prefijos puntuales como /usuarios o /pesajes) --
  // nunca hay que acordarse de sumar una ruta nueva a una lista aparte.
  if (profile?.role === "jugador") {
    redirect("/portal");
  }

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
      {/* h-dvh (no h-full/vh) + overflow-x-hidden: ver el comentario en
          app/layout.tsx -- BottomNav es fixed, así que depende de que esta
          cadena de alturas nunca quede más alta que el viewport real. */}
      <div className="flex h-dvh min-h-dvh overflow-x-hidden">
        <Sidebar />
        {/* min-w-0: sin esto, un hijo con contenido más ancho que el
            viewport (aunque tenga su propio overflow-x-auto) podría hacer
            que este item de flex-row se niegue a encogerse y empuje el
            overflow horizontal hacia el documento entero. */}
        <div className="flex min-h-full min-w-0 flex-1 flex-col">
          <Header />
          {/* pb-20: espacio para que el BottomNav fijo (solo mobile) no
              tape el final del contenido; sm:pb-6 vuelve al padding
              normal una vez que el BottomNav deja de mostrarse.
              overflow-x-hidden explícito (no solo confiar en que
              overflow-y-auto fuerce el otro eje a "auto" por spec, ver
              components/dashboard/report-bar-chart.tsx): cualquier
              contenido que se escape de un componente interno queda
              recortado acá, nunca llega a scrollear la página completa. */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-6">{children}</main>
        </div>
        <BottomNav />
      </div>
    </UserProfileProvider>
  );
}
