"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setUserStatus } from "@/lib/usuarios/actions";

// Client Component a propósito: mismo motivo que PlayerStatusToggle -- el
// closure que arma no puede crearse en un Server Component sin "use server".
// Sin modal de confirmación, mismo criterio que el resto de los switches.

export function UserStatusToggle({ userId, userName, status }: {
  userId: string;
  userName: string;
  status: "active" | "inactive";
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      await setUserStatus(userId, checked ? "active" : "inactive");
    });
  }

  return (
    <Switch
      checked={status === "active"}
      onCheckedChange={handleChange}
      disabled={isPending}
      aria-label={status === "active" ? `Inactivar a ${userName}` : `Activar a ${userName}`}
    />
  );
}
