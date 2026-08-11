"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { buildRecordedAtForDate } from "@/lib/pesajes/timezone";
import {
  weighInBatchRequestSchema,
  weighInDeleteSchema,
  weighInUpdateSchema,
  type WeighInBatchRequest,
  type WeighInDelete,
  type WeighInUpdate,
} from "@/lib/validation/weigh-in";

/**
 * Alta en lote: un mismo recorded_at para todo el lote (el momento del
 * guardado), no uno por jugador -- así todos los pesajes de esta pasada
 * quedan agrupados como "la misma sesión", sin importar el orden en que se
 * tipearon. `date` es la fecha activa en el selector de la pantalla (no
 * siempre "hoy": puede ser un pesaje de un día anterior que se les pasó) --
 * recorded_at combina esa fecha con la hora real actual, ver
 * lib/pesajes/timezone.ts#buildRecordedAtForDate.
 *
 * Sin revisar el rol acá a propósito: la policy RLS "staff insert
 * weigh_ins" (admin/nutricionista) ya lo exige a nivel de base de datos,
 * mismo criterio que el resto de las Server Actions de escritura
 * (createPlayer, etc. en lib/jugadores/actions.ts) -- proxy.ts además
 * bloquea la ruta /pesajes para cualquier otro rol antes de llegar a este
 * formulario.
 */
export async function recordDailyWeighIns(
  input: WeighInBatchRequest
): Promise<{ error?: string; count?: number }> {
  const parsed = weighInBatchRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase, profile } = await requireProfile();
  const recordedAt = buildRecordedAtForDate(parsed.data.date);

  const rows = parsed.data.entries.map((entry) => ({
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

/**
 * Borrado de un pesaje puntual, por `id`. Irreversible (DELETE físico de
 * verdad -- el resto de la app nunca borra filas, solo cambia `status`,
 * ver setPlayerStatus/setUserStatus; acá sí porque un pesaje mal tipeado
 * no tiene un estado "inactivo" razonable, es simplemente un dato erróneo
 * que no debería quedar). La confirmación en dos pasos vive en la UI
 * (WeighInForm), no acá. Misma policy RLS "staff delete weigh_ins"
 * (admin/nutricionista) que ya lo exige a nivel de base de datos.
 */
export async function deleteDailyWeighIn(input: WeighInDelete): Promise<{ error?: string }> {
  const parsed = weighInDeleteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { supabase } = await requireProfile();

  const { error } = await supabase.from("daily_weigh_ins").delete().eq("id", parsed.data.id);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/pesajes");
  return {};
}
