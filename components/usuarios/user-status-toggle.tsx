"use client";

import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { setUserStatus } from "@/lib/usuarios/actions";

// Client Component a propósito: mismo motivo que PlayerStatusToggle -- el
// closure `() => setUserStatus(...)` que se le pasa a ConfirmActionButton
// (Client Component) no puede crearse en servidor sin marcar "use server".

export function UserStatusToggle({ userId, userName, status }: {
  userId: string;
  userName: string;
  status: "active" | "inactive";
}) {
  if (status === "active") {
    return (
      <ConfirmActionButton
        label="Inactivar"
        confirmTitle="Inactivar usuario"
        confirmDescription={`¿Inactivar a ${userName}? Se le bloqueará el acceso de inmediato. No se borra su cuenta: se puede reactivar después.`}
        confirmLabel="Inactivar"
        action={() => setUserStatus(userId, "inactive")}
      />
    );
  }

  return (
    <form action={setUserStatus.bind(null, userId, "active")}>
      <button type="submit" className="btn-secondary">
        Activar
      </button>
    </form>
  );
}
