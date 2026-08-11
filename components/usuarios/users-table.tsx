import { UserActionsMenu } from "@/components/usuarios/user-actions-menu";
import { UserStatusToggle } from "@/components/usuarios/user-status-toggle";
import { ROLE_LABELS } from "@/lib/auth/format";
import type { UserRow } from "@/lib/usuarios/queries";

export function UsersTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
        No hay usuarios para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Correo</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Creado</th>
            <th className="px-4 py-3 font-medium"></th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;

            return (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {user.full_name}
                  {isSelf && <span className="ml-2 text-xs text-muted">(tú)</span>}
                </td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3 text-muted">{ROLE_LABELS[user.role] ?? user.role}</td>
                <td className="px-4 py-3 text-muted">{user.status === "active" ? "Activo" : "Inactivo"}</td>
                <td className="data px-4 py-3 text-muted">{user.created_at.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <UserActionsMenu userId={user.id} userName={user.full_name} />
                </td>
                <td className="px-4 py-3 text-right">
                  {!isSelf && (
                    <UserStatusToggle userId={user.id} userName={user.full_name} status={user.status} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
