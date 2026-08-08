import { z } from "zod";

// Todos los campos numéricos llegan como string desde <input type="number">
// (sin z.coerce, por el mismo motivo que en player.ts: mantener Input===Output
// para que zodResolver + useForm tipen bien). La conversión a number|null pasa
// por parseOptionalNumber/parseRequiredNumber, ya en la server action.
export const assessmentFormSchema = z.object({
  assessment_date: z.string().min(1, "La fecha es obligatoria."),
  label: z.string().trim().min(1, "La etiqueta es obligatoria.").max(100),

  weight_kg: z.string().min(1, "El peso es obligatorio."),
  height_cm: z.string().min(1, "La talla es obligatoria."),
  sitting_height_cm: z.string().optional(),
  wingspan_cm: z.string().optional(),

  skinfold_triceps: z.string().optional(),
  skinfold_subscapular: z.string().optional(),
  skinfold_biceps: z.string().optional(),
  skinfold_iliac_crest: z.string().optional(),
  skinfold_supraspinal: z.string().optional(),
  skinfold_abdominal: z.string().optional(),
  skinfold_thigh: z.string().optional(),
  skinfold_calf: z.string().optional(),

  girth_relaxed_arm: z.string().optional(),
  girth_flexed_arm: z.string().optional(),
  girth_waist: z.string().optional(),
  girth_hip: z.string().optional(),
  girth_thigh: z.string().optional(),
  girth_calf: z.string().optional(),

  diameter_humerus: z.string().optional(),
  diameter_bistyloid: z.string().optional(),
  diameter_femur: z.string().optional(),
});

export type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

/** "" / undefined -> null. Redondea a 1 decimal (precisión de captura). */
export function parseOptionalNumber(value: string | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 10) / 10;
}
