"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { weighInBatchSchema, weighInUpdateSchema, type WeighInEntry, type WeighInUpdate } from "@/lib/validation/weigh-in";

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

/**
 * Corrección de un pesaje ya registrado: UPDATE por `id` (nunca por
 * jugador+fecha, ver weighInUpdateSchema). Solo toca weight_kg -- no
 * recorded_at ni recorded_by: corregir un valor no debería cambiar cuándo
 * (ni quién) quedó registrado originalmente, y la tabla no tiene columnas
 * de auditoría de edición (updated_at/updated_by) para reflejar eso de
 * todas formas. Misma policy RLS "staff update weigh_ins"
 * (admin/nutricionista) que ya exige esto a nivel de base de datos -- sin
 * chequeo de rol acá, mismo criterio que recordDailyWeighIns() arriba.
 */
export async function updateDailyWeighIn(
  input: WeighInUpdate
): Promise<{ error?: string }> {
  const parsed = weighInUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireProfile();

  const { error } = await supabase
    .from("daily_weigh_ins")
    .update({ weight_kg: parsed.data.weight_kg })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pesajes");
  return {};
}
