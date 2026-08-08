import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlayerStatusFilter = "active" | "inactive" | "all";

const PLAYER_PHOTOS_BUCKET = "player-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 5; // 5 minutos: "expiración corta" pedida en la spec.

export async function listPlayers(status: PlayerStatusFilter = "active") {
  const supabase = await createClient();

  let query = supabase
    .from("players")
    .select(
      "id, document, full_name, birth_date, sex, home_club, status, position:positions(name), category:categories(name)"
    )
    .order("full_name");

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPlayerById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select(
      "id, document, full_name, birth_date, sex, race_id, position_id, category_id, home_club, status, photo_path, position:positions(name), category:categories(name), race:races(name, muscle_mass_constant)"
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Nunca se guarda ni se expone una URL pública: se firma al vuelo, en
 * servidor, con el cliente service_role (el bucket es privado y no tiene
 * policies de storage.objects -- el cliente anon no puede leerlo directo).
 */
export async function getPlayerPhotoUrl(photoPath: string | null): Promise<string | null> {
  if (!photoPath) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(PLAYER_PHOTOS_BUCKET)
    .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);

  if (error) return null;
  return data.signedUrl;
}
