import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Cliente de Supabase para Client Components (navegador).
 * Usa @supabase/ssr para que la sesión quede sincronizada vía cookies con el
 * servidor (middleware y Server Components) en vez de solo localStorage.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Revisa tu .env.local (ver .env.example)."
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
