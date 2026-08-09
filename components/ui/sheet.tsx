"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

/**
 * Panel lateral (slide-over) sobre @radix-ui/react-dialog -- misma
 * primitiva que usa el Sheet de shadcn/ui, mismo comportamiento (foco
 * atrapado, cierra con Escape/clic fuera, desliza desde la derecha), pero
 * estilizado a mano con el Design System del proyecto (superficie blanca,
 * borde fino, sin colores llenos) en vez de copiar el estilo de referencia.
 * Transición vía CSS puro (translate-x + data-state), sin librería de
 * animación: Radix mantiene el nodo montado en data-state="closed" hasta
 * que termina la transición, así que no hace falta forceMount.
 */
export const Root = DialogPrimitive.Root;
export const Trigger = DialogPrimitive.Trigger;
export const Close = DialogPrimitive.Close;

export function Content({
  children,
  className = "",
  ...props
}: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
      />
      <DialogPrimitive.Content
        className={`fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-border bg-surface outline-none transition-transform duration-200 ease-out data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 sm:max-w-2xl ${className}`}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function Header({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
      <div className="min-w-0">{children}</div>
      <Close
        className="btn-secondary shrink-0"
        aria-label="Cerrar"
      >
        ✕
      </Close>
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <DialogPrimitive.Title className="text-base font-semibold text-foreground">{children}</DialogPrimitive.Title>;
}

export function Description({ children }: { children: ReactNode }) {
  return <DialogPrimitive.Description className="mt-1 text-sm text-muted">{children}</DialogPrimitive.Description>;
}

export function Body({ children }: { children: ReactNode }) {
  return <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>;
}
