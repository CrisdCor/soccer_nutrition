"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { thresholdFormSchema, type ThresholdFormValues } from "@/lib/validation/threshold";

// Umbrales de referencia (Suma 6 Pliegues, AKS): configurables por
// organización, solo admin (política RLS "ALL ... current_user_role() = 'admin'").
// Nunca se edita/borra un umbral ya guardado: una nueva vigencia es una fila
// nueva con su propio effective_from, para conservar el histórico completo.
export async function createThreshold(values: ThresholdFormValues) {
  const parsed = thresholdFormSchema.parse(values);
  const { supabase, profile } = await requireAdmin();

  const lowCut = Number(parsed.low_cut);
  const highCut = Number(parsed.high_cut);

  if (!Number.isFinite(lowCut) || !Number.isFinite(highCut)) {
    return { error: "Los umbrales deben ser números válidos." };
  }
  if (lowCut >= highCut) {
    return { error: "El umbral bajo debe ser menor que el umbral alto." };
  }

  const { error } = await supabase.from("reference_thresholds").insert({
    organization_id: profile.organization_id,
    metric: parsed.metric,
    low_cut: lowCut,
    high_cut: highCut,
    effective_from: parsed.effective_from,
    created_by: profile.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/configuracion");
}
