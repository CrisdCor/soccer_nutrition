"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { weighInBatchSchema, type WeighInEntry } from "@/lib/validation/weigh-in";

/**
 * Alta en lote: un mismo recorded_at para todo el lote (el momento del
 * guardado), no uno por jugador -- así todos los pesajes de esta pasada
 * quedan agrupados como "la misma sesión", sin importar el orden en que se
 * tipearon.
 *
 * Sin revisar el rol acá a propósito: la policy RLS "staff insert
 * weigh_ins" (admin/nutricionista) ya lo exige a nivel de base de datos,
 * mismo criterio que el resto de las Server Actions de escritura
 * (createPlayer, etc. en lib/jugadores/actions.ts) -- proxy.ts además
 * bloquea la ruta /pesajes para cualquier otro rol antes de llegar a este
 * formulario.
 */
export async function recordDailyWeighIns(
  entries: WeighInEntry[]
): Promise<{ error?: string; count?: number }> {
  const parsed = weighInBatchSchema.safeParse(entries);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, profile } = await requireProfile();
  const recordedAt = new Date().toISOString();

  const rows = parsed.data.map((entry) => ({
    organization_id: profile.organization_id,
    player_id: entry.player_id,
    weight_kg: entry.weight_kg,
    recorded_by: profile.id,
    recorded_at: recordedAt,
  }));

  const { error } = await supabase.from("daily_weigh_ins").insert(rows);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pesajes");
  return { count: rows.length };
}
