import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/auth/user-profile-context";

/**
 * Resuelve { user, profile, supabase } para Server Actions y Server
 * Components. El middleware (proxy.ts) ya garantiza que hay sesión antes de
 * llegar aquí, pero cada mutación vuelve a comprobarlo (defensa en
 * profundidad) y necesita el cliente ya autenticado para que RLS aplique.
 */
export async function requireProfile() {
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
    .single<UserProfile>();

  if (!profile) {
    throw new Error("El usuario no tiene un perfil en user_profiles.");
  }

  return { supabase, user, profile };
}

export async function requireAdmin() {
  const result = await requireProfile();

  if (result.profile.role !== "admin") {
    throw new Error("Esta acción requiere rol admin.");
  }

  return result;
}
