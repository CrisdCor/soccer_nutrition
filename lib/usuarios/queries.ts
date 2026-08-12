import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export type UserRow = {
  id: string;
  full_name: string;
  role: Database["public"]["Enums"]["user_role"];
  status: "active" | "inactive";
  created_at: string;
  email: string;
};

/**
 * user_profiles es la fuente de verdad para nombre/rol/estado (nunca se
 * duplica desde metadata). El email SÍ vive únicamente en auth.users, que no
 * es legible desde el cliente anon — por eso se resuelve aquí, en el
 * servidor, con la Admin API (service_role).
 */
export async function listUsers(): Promise<UserRow[]> {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, role, status, created_at")
    .order("full_name");

  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  const admin = createAdminClient();

  return Promise.all(
    profiles.map(async (profile) => {
      const { data } = await admin.auth.admin.getUserById(profile.id);
      return { ...profile, email: data?.user?.email ?? "—" };
    })
  );
}

/** Solo para mostrar el nombre de la organización preseleccionada (no editable) en el form de alta. */
export async function getOrganizationName(organizationId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .single();

  return data?.name ?? "—";
}

/**
 * Jugadores activos que todavía no tienen una cuenta vinculada -- para el
 * picker de "Jugador vinculado" al crear un usuario role='jugador'. Se
 * excluyen los ya vinculados (cualquier user_profiles.player_id ya
 * asignado) para no ofrecer crear una segunda cuenta para el mismo
 * jugador por error; no hay constraint UNIQUE a nivel de base que lo
 * impida, así que esto es la única barrera.
 */
export async function listLinkablePlayers(): Promise<{ id: string; full_name: string }[]> {
  const supabase = await createClient();

  const [{ data: players, error: playersError }, { data: linked, error: linkedError }] = await Promise.all([
    supabase.from("players").select("id, full_name").eq("status", "active").order("full_name"),
    supabase.from("user_profiles").select("player_id").not("player_id", "is", null),
  ]);

  if (playersError) throw playersError;
  if (linkedError) throw linkedError;

  const linkedIds = new Set((linked ?? []).map((row) => row.player_id));
  return (players ?? []).filter((player) => !linkedIds.has(player.id));
}

export async function getUserRowById(id: string): Promise<UserRow | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, role, status, created_at")
    .eq("id", id)
    .single();

  if (error || !profile) return null;

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(profile.id);

  return { ...profile, email: data?.user?.email ?? "—" };
}
