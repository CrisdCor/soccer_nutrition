import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Única ruta pública de la app. Todo lo demás requiere sesión por defecto
// (deny-by-default). Estos prefijos además requieren role = 'admin', igual
// que las políticas RLS de positions/categories ("ALL ... current_user_role()
// = 'admin'") y de /usuarios. /configuracion YA NO es admin-only a nivel de
// ruta: umbrales de referencia sigue siendo admin-only (gating dentro de la
// página), pero diet_types/food_groups son editables por cualquier rol —
// igual que sus políticas RLS ("ALL (organization_id = current_user_org())",
// sin chequeo de rol).
const PUBLIC_ROUTES = ["/login"];
const ADMIN_ROUTE_PREFIXES = ["/usuarios", "/catalogos"];
// Pesajes (daily_weigh_ins): solo quien registra puede entrar, igual que la
// policy RLS "staff insert weigh_ins" (admin/nutricionista) -- lider es de
// solo lectura en toda la app y jugador ni siquiera debería ver el módulo.
const STAFF_WRITE_ROUTE_PREFIXES = ["/pesajes"];

// role = 'lider' es de solo lectura en toda la app (RLS ya lo bloquea a
// nivel de escritura). Crear/editar jugador son las únicas rutas de
// creación/edición que siguen siendo standalone -- valoraciones y planes
// nutricionales se crean/editan en paneles laterales (Sheet) disparados por
// botones, no por URL, así que ocultar esos botones alcanza para ese caso.
function isLiderBlockedRoute(pathname: string): boolean {
  return pathname === "/jugadores/nuevo" || (pathname.startsWith("/jugadores/") && pathname.endsWith("/editar"));
}

export async function proxy(request: NextRequest) {
  // response empieza como passthrough; createServerClient la reasigna cada
  // vez que necesita escribir cookies de sesión refrescadas.
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // No insertar lógica entre createServerClient y getUser(): getUser() es lo
  // que efectivamente refresca el token si está vencido.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 1) Sin sesión intentando entrar a una ruta protegida -> /login
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2) Con sesión intentando entrar a /login -> /dashboard
  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // 3) Rutas admin-only. Se verifica contra user_profiles (no contra
  //    metadata del JWT, que puede quedar desactualizada si el rol cambió
  //    después de emitido el token).
  if (user && ADMIN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3b) Rutas de solo admin/nutricionista (staff que registra pesajes).
  if (user && STAFF_WRITE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "nutricionista") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 4) lider no puede crear/editar jugadores -- redirige al listado en vez
  //    de dejarlo llegar a un formulario que solo fallaría al enviarlo.
  if (user && isLiderBlockedRoute(pathname)) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "lider") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/jugadores";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Corre en todo excepto assets estáticos y archivos de imagen.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
