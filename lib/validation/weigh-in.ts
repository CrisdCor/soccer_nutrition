import { z } from "zod";

export const weighInEntrySchema = z.object({
  player_id: z.string().uuid(),
  // 300kg como tope generoso (nunca vamos a acercarnos con jugadores de
  // fútbol) solo para atajar errores de tipeo evidentes, ej. "7430" en vez
  // de "74.3".
  weight_kg: z.number().positive().max(300),
});

export const weighInBatchSchema = z
  .array(weighInEntrySchema)
  .min(1, "Ingresa al menos un peso antes de guardar.");

export type WeighInEntry = z.infer<typeof weighInEntrySchema>;
