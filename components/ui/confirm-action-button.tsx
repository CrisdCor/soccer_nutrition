"use client";

import { useState, useTransition } from "react";

/**
 * Botón que exige confirmación explícita antes de ejecutar una acción con
 * consecuencia real (ej. inactivar). Deliberadamente neutro: el botón que
 * abre el modal y el de "Confirmar" mantienen el estilo secundario
 * gris/blanco del Design System, nunca rojo — el rojo se reserva para casos
 * que lo ameriten, y aquí el riesgo ya está mitigado con la confirmación.
 */
export function ConfirmActionButton({
  label,
  confirmTitle,
  confirmDescription,
  confirmLabel = "Confirmar",
  action,
}: {
  label: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel?: string;
  action: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await action();
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className="btn-secondary" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5">
            <h3 id="confirm-dialog-title" className="text-sm font-semibold text-foreground">
              {confirmTitle}
            </h3>
            <p className="mt-2 text-sm text-muted">{confirmDescription}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </button>
              <button type="button" className="btn-secondary" onClick={handleConfirm} disabled={isPending}>
                {isPending ? "Procesando…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
