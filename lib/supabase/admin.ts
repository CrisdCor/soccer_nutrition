import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente con la service_role key: bypassa RLS por completo (equivalente a
 * acceso root sobre la base). SOLO se debe usar dentro de Server Actions o
 * Route Handlers ("use server") para llamadas a la Admin API de Supabase
 * Auth (auth.admin.createUser, auth.admin.updateUserById, etc.) — nunca para
 * leer/escribir tablas de negocio, que deben seguir pasando por RLS con el
 * cliente normal (lib/supabase/server.ts).
 *
 * La key vive en SUPABASE_SERVICE_ROLE_KEY (sin prefijo NEXT_PUBLIC_), así
 * que Next.js nunca la incluye en el bundle del navegador. Aun así, se
 * verifica en runtime que esto no se ejecute en el cliente, por si algo la
 * importa por error desde un Client Component.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() no debe ejecutarse en el navegador.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_URL). Configúrala en .env.local " +
        "(ver .env.example) y como variable de entorno en Vercel — nunca con prefijo NEXT_PUBLIC_."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
