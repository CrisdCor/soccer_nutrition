import { createClient } from "@/lib/supabase/server";

export async function listRaces() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("races")
    .select("id, name, muscle_mass_constant")
    .order("id");

  if (error) throw error;
  return data ?? [];
}

export async function listPositions(options?: { activeOnly?: boolean }) {
  const supabase = await createClient();
  let query = supabase.from("positions").select("id, name, active").order("name");

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function listCategories(options?: { activeOnly?: boolean }) {
  const supabase = await createClient();
  let query = supabase.from("categories").select("id, name, active").order("name");

  if (options?.activeOnly) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
