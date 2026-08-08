"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createUserFormSchema,
  editUserFormSchema,
  type CreateUserFormValues,
  type EditUserFormValues,
} from "@/lib/validation/user";

// "Ban" con duración muy larga (~100 años) como equivalente práctico de
// "indefinido": la Admin API de Supabase no tiene un valor literal infinito,
// solo duraciones. Para reactivar se usa "none", que es el valor documentado
// para levantar el ban.
const INDEFINITE_BAN = "876000h";

/**
 * Alta de usuario vía Admin API (nunca signup público). El trigger
 * handle_new_user (SECURITY DEFINER) ya crea la fila en user_profiles a
 * partir de user_metadata — no se duplica esa inserción aquí.
 */
export async function createUser(values: CreateUserFormValues) {
  const parsed = createUserFormSchema.parse(values);
  const { profile } = await requireAdmin();

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password,
    email_confirm: true,
    user_metadata: {
      role: parsed.role,
      full_name: parsed.full_name,
      // Nunca se toma organization_id del formulario: siempre la del admin
      // que está creando el usuario (por ahora, la única organización).
      organization_id: profile.organization_id,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already been registered")) {
      return { error: "Ya existe un usuario con ese correo." };
    }
    return { error: error.message };
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

/**
 * Edición: solo full_name y role, directo sobre user_profiles con el
 * cliente normal (RLS admin-only vía la policy "update own org profiles admin").
 */
export async function updateUserProfile(userId: string, values: EditUserFormValues) {
  const parsed = editUserFormSchema.parse(values);
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("user_profiles")
    .update({ full_name: parsed.full_name, role: parsed.role })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

/**
 * Inactivar/activar: nunca se borra el usuario. Se bloquea el login vía la
 * Admin API (ban) y se refleja el estado en user_profiles.status. Un admin
 * no puede inactivarse a sí mismo (se valida aquí y además el botón se
 * oculta para la fila propia en la tabla).
 */
export async function setUserStatus(userId: string, status: "active" | "inactive"): Promise<void> {
  const { supabase, profile } = await requireAdmin();

  if (status === "inactive" && userId === profile.id) {
    throw new Error("No puedes inactivar tu propio usuario.");
  }

  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: status === "inactive" ? INDEFINITE_BAN : "none",
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const { error } = await supabase.from("user_profiles").update({ status }).eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/usuarios");
}
