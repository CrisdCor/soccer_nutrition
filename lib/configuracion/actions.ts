"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireProfile } from "@/lib/auth/session";
import { catalogItemSchema, type CatalogItemValues } from "@/lib/validation/catalog";
import { thresholdFormSchema, type ThresholdFormValues } from "@/lib/validation/threshold";

// Umbrales de referencia (Suma 6 Pliegues, AKS, %Grasa, Variación de Peso):
// configurables por organización, solo admin (política RLS
// "ALL ... current_user_role() = 'admin'"). Un solo umbral vigente por
// métrica (`UNIQUE(organization_id, metric)` en reference_thresholds) --
// guardar reemplaza el umbral existente de esa métrica en vez de acumular
// histórico por effective_from; upsert por (organization_id, metric) en vez
// de insert, para que esto no rompa contra la restricción única.
export async function upsertThreshold(values: ThresholdFormValues) {
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

  const { error } = await supabase.from("reference_thresholds").upsert(
    {
      organization_id: profile.organization_id,
      metric: parsed.metric,
      low_cut: lowCut,
      high_cut: highCut,
      effective_from: parsed.effective_from,
      created_by: profile.id,
    },
    { onConflict: "organization_id,metric" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/configuracion");
}

// diet_types / food_groups: cualquier rol de la organización (nutricionista o
// admin) los administra -- sin requireAdmin, a diferencia de los umbrales.
// Nunca se borran físicamente, solo se desactivan (mismo patrón que
// positions/categories).

export async function createDietType(values: CatalogItemValues) {
  const parsed = catalogItemSchema.parse(values);
  const { supabase, profile } = await requireProfile();

  const { error } = await supabase.from("diet_types").insert({
    organization_id: profile.organization_id,
    name: parsed.name,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/configuracion");
}

export async function toggleDietTypeActive(id: string, active: boolean): Promise<void> {
  const { supabase } = await requireProfile();

  const { error } = await supabase.from("diet_types").update({ active }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/configuracion");
}

export async function createFoodGroup(values: CatalogItemValues) {
  const parsed = catalogItemSchema.parse(values);
  const { supabase, profile } = await requireProfile();

  const { error } = await supabase.from("food_groups").insert({
    organization_id: profile.organization_id,
    name: parsed.name,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/configuracion");
}

export async function toggleFoodGroupActive(id: string, active: boolean): Promise<void> {
  const { supabase } = await requireProfile();

  const { error } = await supabase.from("food_groups").update({ active }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/configuracion");
}
