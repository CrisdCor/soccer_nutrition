import { z } from "zod";

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida.");

export const weighInEntrySchema = z.object({
  player_id: z.string().uuid(),
  // 300kg como tope generoso (nunca vamos a acercarnos con jugadores de
  // fútbol) solo para atajar errores de tipeo evidentes, ej. "7430" en vez
  // de "74.3".
  weight_kg: z.number().positive().max(300),
});

// date: la fecha activa en el selector de la pantalla (no siempre "hoy") --
// recordDailyWeighIns() la usa para construir recorded_at, ver
// lib/pesajes/timezone.ts#buildRecordedAtForDate.
export const weighInBatchRequestSchema = z.object({
  date: dateStringSchema,
  entries: z.array(weighInEntrySchema).min(1, "Ingresa al menos un peso antes de guardar."),
});

export type WeighInEntry = z.infer<typeof weighInEntrySchema>;
export type WeighInBatchRequest = z.infer<typeof weighInBatchRequestSchema>;

// Corrección de un registro existente: se identifica por su `id`, no por
// jugador+fecha -- puede haber más de un pesaje el mismo día (entreno +
// partido) y solo se corrige el que se clickeó puntualmente.
export const weighInUpdateSchema = z.object({
  id: z.string().uuid(),
  weight_kg: z.number().positive().max(300),
});

export type WeighInUpdate = z.infer<typeof weighInUpdateSchema>;

export const weighInDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type WeighInDelete = z.infer<typeof weighInDeleteSchema>;
