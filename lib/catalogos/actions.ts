"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { catalogItemSchema, type CatalogItemValues } from "@/lib/validation/catalog";

// Posiciones y categorías: CRUD simple, solo admin (política RLS "ALL ...
// current_user_role() = 'admin'"). Nunca se borran físicamente, solo se
// desactivan (active = false) — igual que jugadores y valoraciones.

export async function createPosition(values: CatalogItemValues) {
  const parsed = catalogItemSchema.parse(values);
  const { supabase, profile } = await requireAdmin();

  const { error } = await supabase.from("positions").insert({
    organization_id: profile.organization_id,
    name: parsed.name,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos");
}

export async function togglePositionActive(id: string, active: boolean): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("positions").update({ active }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/catalogos");
}

export async function createCategory(values: CatalogItemValues) {
  const parsed = catalogItemSchema.parse(values);
  const { supabase, profile } = await requireAdmin();

  const { error } = await supabase.from("categories").insert({
    organization_id: profile.organization_id,
    name: parsed.name,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos");
}

export async function toggleCategoryActive(id: string, active: boolean): Promise<void> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("categories").update({ active }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/catalogos");
}
