import { createClient } from "@/lib/supabase/server";

export type PlayerStatusFilter = "active" | "inactive" | "all";

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
      "id, document, full_name, birth_date, sex, race_id, position_id, category_id, home_club, status, position:positions(name), category:categories(name), race:races(name, muscle_mass_constant)"
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
