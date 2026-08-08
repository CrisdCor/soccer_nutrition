import Link from "next/link";
import { UsersTable } from "@/components/usuarios/users-table";
import { requireProfile } from "@/lib/auth/session";
import { listUsers } from "@/lib/usuarios/queries";

export default async function UsuariosPage() {
  const [users, { profile }] = await Promise.all([listUsers(), requireProfile()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
          <p className="text-sm text-muted">
            Solo admin. Nunca se borran: se inactivan (bloquea el login vía Supabase Auth).
          </p>
        </div>
        <Link href="/usuarios/nuevo" className="btn-primary">
          Nuevo usuario
        </Link>
      </div>

      <UsersTable users={users} currentUserId={profile.id} />
    </div>
  );
}
