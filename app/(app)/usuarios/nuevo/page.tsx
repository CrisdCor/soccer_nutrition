import { UserForm } from "@/components/usuarios/user-form";
import { requireAdmin } from "@/lib/auth/session";
import { createUser } from "@/lib/usuarios/actions";
import { getOrganizationName } from "@/lib/usuarios/queries";

export default async function NuevoUsuarioPage() {
  const { profile } = await requireAdmin();
  const organizationName = await getOrganizationName(profile.organization_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Nuevo usuario</h2>
        <p className="text-sm text-muted">Se crea vía la Admin API de Supabase — no hay registro público.</p>
      </div>

      <UserForm organizationName={organizationName} action={createUser} />
    </div>
  );
}
