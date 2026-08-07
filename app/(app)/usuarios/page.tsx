import { PlaceholderPage } from "@/components/ui/placeholder-page";

// Acceso restringido a role = 'admin' (ver middleware.ts). El siguiente
// módulo del MVP construye el CRUD real usando la Admin API de Supabase.
export default function UsuariosPage() {
  return (
    <PlaceholderPage
      title="Usuarios"
      description="Creación y gestión de usuarios (admin) vía Supabase Admin API."
    />
  );
}
