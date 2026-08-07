import { redirect } from "next/navigation";

// "/" no tiene contenido propio: el middleware ya exige sesión para llegar
// aquí (no está en PUBLIC_ROUTES), así que solo redirige al dashboard real.
export default function RootPage() {
  redirect("/dashboard");
}
