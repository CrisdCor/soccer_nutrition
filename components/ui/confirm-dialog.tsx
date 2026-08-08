"use client";

import { useState, useTransition, type ReactNode } from "react";

type PendingAction = {
  title: string;
  description: string;
  confirmLabel: string;
  action: () => Promise<void>;
};

/**
 * Misma idea que ConfirmActionButton, pero como hook: permite disparar el
 * modal de confirmación desde donde sea (ej. un DropdownMenu.Item, que no
 * puede anidar su propio <button> con estado local) reutilizando el mismo
 * modal neutro (gris/blanco, nunca rojo).
 */
export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestConfirm(opts: {
    title: string;
    description: string;
    confirmLabel?: string;
    action: () => Promise<void>;
  }) {
    setPending({ confirmLabel: "Confirmar", ...opts });
  }

  function handleConfirm() {
    if (!pending) return;
    startTransition(async () => {
      await pending.action();
      setPending(null);
    });
  }

  const dialog: ReactNode = pending ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5">
        <h3 id="confirm-dialog-title" className="text-sm font-semibold text-foreground">
          {pending.title}
        </h3>
        <p className="mt-2 text-sm text-muted">{pending.description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setPending(null)}
            disabled={isPending}
          >
            Cancelar
          </button>
          <button type="button" className="btn-secondary" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Procesando…" : pending.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { requestConfirm, dialog };
}
