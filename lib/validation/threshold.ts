import { z } from "zod";

export const thresholdFormSchema = z.object({
  metric: z.enum(["skinfold_sum", "aks_index", "weight_change_pct", "fat_percentage"], {
    message: "Selecciona la métrica.",
  }),
  low_cut: z.string().min(1, "El umbral bajo es obligatorio."),
  high_cut: z.string().min(1, "El umbral alto es obligatorio."),
  effective_from: z.string().min(1, "La fecha de vigencia es obligatoria."),
});

export type ThresholdFormValues = z.infer<typeof thresholdFormSchema>;
