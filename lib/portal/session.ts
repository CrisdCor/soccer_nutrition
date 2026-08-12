import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";

/**
 * Como requireProfile(), pero además exige role='jugador' y resuelve el
 * player_id vinculado -- usado tanto en app/portal/layout.tsx (gate) como
 * en app/portal/page.tsx (para saber qué jugador mostrar). El fetch de
 * player_id se repite entre layout y page a propósito: no hay forma
 * limpia de pasar props entre ellos en el App Router, y es una fila
 * liviana -- mismo criterio que el resto de la app (ver requireProfile(),
 * que también se llama más de una vez por request en varios lugares).
 *
 * playerId puede volver null si la cuenta quedó sin vincular (no debería
 * pasar si se creó desde /usuarios/nuevo, pero se maneja igual en vez de
 * asumir) -- el caller decide qué mostrar en ese caso.
 */
export async function requirePlayerProfile() {
  const { supabase, user, profile } = await requireProfile();

  if (profile.role !== "jugador") {
    redirect("/dashboard");
  }

  const { data: row } = await supabase.from("user_profiles").select("player_id").eq("id", user.id).single();

  return { supabase, user, profile, playerId: row?.player_id ?? null };
}
