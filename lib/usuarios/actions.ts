"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createUserFormSchema,
  editUserFormSchema,
  resetPasswordSchema,
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
      // Solo para role='jugador' -- el trigger handle_new_user ya lo toma
      // de acá para user_profiles.player_id (validado por el .refine() de
      // createUserFormSchema: siempre viene si role === 'jugador').
      ...(parsed.role === "jugador" ? { player_id: parsed.player_id } : {}),
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

/**
 * Reset de contraseña sin flujo de email (equipo chico, admin resuelve el
 * olvido directamente): misma Admin API y mismo createAdminClient() que
 * createUser/setUserStatus arriba, sin duplicar el acceso a service_role.
 * No hay redirect ni revalidatePath -- a diferencia de create/editar, acá
 * no cambia nada que la UI ya esté mostrando (el modal se queda abierto
 * para que el admin copie la contraseña antes de cerrar).
 */
export async function resetUserPassword(
  userId: string,
  values: { password: string }
): Promise<{ error?: string }> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Contraseña inválida." };
  }

  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  return {};
}
