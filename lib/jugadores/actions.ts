"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { playerFormSchema, type PlayerFormValues } from "@/lib/validation/player";

export async function createPlayer(values: PlayerFormValues) {
  const parsed = playerFormSchema.parse(values);
  const { supabase, profile } = await requireProfile();

  const { data, error } = await supabase
    .from("players")
    .insert({
      organization_id: profile.organization_id,
      document: parsed.document,
      full_name: parsed.full_name,
      birth_date: parsed.birth_date,
      sex: parsed.sex,
      race_id: Number(parsed.race_id),
      position_id: parsed.position_id || null,
      category_id: parsed.category_id || null,
      home_club: parsed.home_club ?? false,
    })
    .select("id")
    .single();

  if (error) {
    // El documento es único por organización: un choque de unicidad es el
    // error más probable aquí.
    if (error.code === "23505") {
      return { error: "Ya existe un jugador con ese documento en la organización." };
    }
    return { error: error.message };
  }

  revalidatePath("/jugadores");
  redirect(`/jugadores/${data.id}`);
}

export async function updatePlayer(playerId: string, values: PlayerFormValues) {
  const parsed = playerFormSchema.parse(values);
  const { supabase } = await requireProfile();

  const { error } = await supabase
    .from("players")
    .update({
      document: parsed.document,
      full_name: parsed.full_name,
      birth_date: parsed.birth_date,
      sex: parsed.sex,
      race_id: Number(parsed.race_id),
      position_id: parsed.position_id || null,
      category_id: parsed.category_id || null,
      home_club: parsed.home_club ?? false,
    })
    .eq("id", playerId);

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe un jugador con ese documento en la organización." };
    }
    return { error: error.message };
  }

  revalidatePath("/jugadores");
  revalidatePath(`/jugadores/${playerId}`);
  redirect(`/jugadores/${playerId}`);
}

/**
 * Nunca hay DELETE físico de jugadores: solo se cambia el status.
 * Retorna void (no {error}) para poder usarse directo como action de un
 * <form> sin envolturas — los errores quedan para la nearest error boundary.
 */
export async function setPlayerStatus(
  playerId: string,
  status: "active" | "inactive"
): Promise<void> {
  const { supabase } = await requireProfile();

  const { error } = await supabase.from("players").update({ status }).eq("id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/jugadores");
  revalidatePath(`/jugadores/${playerId}`);
}
