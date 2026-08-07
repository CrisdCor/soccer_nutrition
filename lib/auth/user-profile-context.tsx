"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Database } from "@/lib/supabase/database.types";

export type UserProfile = {
  id: string;
  organization_id: string;
  role: Database["public"]["Enums"]["user_role"];
  full_name: string;
};

const UserProfileContext = createContext<UserProfile | null>(null);

/**
 * Expone el perfil (id, role, organization_id, full_name) del usuario
 * autenticado a los Client Components, para poder mostrar/ocultar UI según
 * rol (ej. el ítem "Usuarios" del sidebar, visible solo para admin).
 *
 * El valor se resuelve una sola vez en el servidor —en app/(app)/layout.tsx,
 * vía lib/supabase/server.ts— y se pasa aquí como prop; no se vuelve a
 * pedir a Supabase desde el cliente.
 */
export function UserProfileProvider({
  profile,
  children,
}: {
  profile: UserProfile;
  children: ReactNode;
}) {
  return <UserProfileContext.Provider value={profile}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile(): UserProfile {
  const profile = useContext(UserProfileContext);

  if (!profile) {
    throw new Error("useUserProfile() debe usarse dentro de <UserProfileProvider>.");
  }

  return profile;
}
