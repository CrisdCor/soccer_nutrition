import { notFound, redirect } from "next/navigation";
import { EditUserForm } from "@/components/usuarios/edit-user-form";
import { updateUserProfile } from "@/lib/usuarios/actions";
import { getUserRowById } from "@/lib/usuarios/queries";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserRowById(id);

  if (!user) {
    notFound();
  }

  // role = 'jugador' es para el futuro portal de autoservicio del jugador
  // (ver player_id en user_profiles): todavía no hay flujo de alta/edición
  // para esas cuentas -- este formulario (Admin/Nutricionista/Líder) no
  // aplica, así que no se ofrece acá en vez de fallar a medias.
  if (user.role === "jugador") {
    redirect("/usuarios");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Editar usuario</h2>
        <p className="text-sm text-muted">{user.full_name}</p>
      </div>

      <EditUserForm
        email={user.email}
        defaultValues={{ full_name: user.full_name, role: user.role }}
        action={updateUserProfile.bind(null, user.id)}
      />
    </div>
  );
}
