import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu .env.local (ver .env.example)."
  );
}

// Cliente único de Supabase para todo el frontend. La anon key es pública y
// toda tabla tiene RLS activo, por lo que es seguro usar este mismo cliente
// tanto en componentes de cliente como en Server Components/Route Handlers
// (la sesión del usuario autenticado se aplica vía Supabase Auth).
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
