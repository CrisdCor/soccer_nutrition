import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Única ruta pública de la app. Todo lo demás requiere sesión por defecto
// (deny-by-default). Estos prefijos además requieren role = 'admin', igual
// que las políticas RLS de positions/categories/reference_thresholds
// ("ALL ... current_user_role() = 'admin'") y de /usuarios (gestión futura).
const PUBLIC_ROUTES = ["/login"];
const ADMIN_ROUTE_PREFIXES = ["/usuarios", "/catalogos", "/configuracion"];

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

  return response;
}

export const config = {
  matcher: [
    // Corre en todo excepto assets estáticos y archivos de imagen.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
