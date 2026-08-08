"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { playerFormSchema, type PlayerFormValues } from "@/lib/validation/player";

const PLAYER_PHOTOS_BUCKET = "player-photos";
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

/**
 * Sube la foto a un bucket privado de Storage (nunca público: hay menores
 * de edad en varias categorías) y guarda solo el path en players.photo_path
 * -- nunca una URL pública. La lectura se hace después vía URL firmada de
 * corta duración (ver lib/jugadores/queries.ts).
 */
export async function uploadPlayerPhoto(playerId: string, formData: FormData): Promise<void> {
  const { supabase, profile } = await requireProfile();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Selecciona una imagen.");
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error("La imagen debe ser JPEG, PNG o WEBP.");
  }

  const admin = createAdminClient();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${profile.organization_id}/${playerId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(PLAYER_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error } = await supabase.from("players").update({ photo_path: path }).eq("id", playerId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jugadores/${playerId}`);
  revalidatePath(`/jugadores/${playerId}/editar`);
}
