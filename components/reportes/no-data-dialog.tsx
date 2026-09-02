"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

/**
 * Modal chico centrado, puramente informativo -- sin otra acción que
 * cerrarlo (clic en la X, clic afuera, o Escape). Distinto de Sheet
 * (panel lateral para formularios/detalle) y del drawer inferior de
 * MoreMenuDrawer: acá el contenido es una sola línea de advertencia, así
 * que un panel chico y centrado tiene más sentido que cualquiera de los
 * otros dos. Mismo criterio de "sin fondo de color sólido" que los
 * role="alert" de los formularios (ver ThresholdForm, UserForm, etc.):
 * superficie blanca, borde, texto neutro -- el único color es el ícono,
 * en rojo (mismo tono que "fuera de rango"/valores altos en el resto de
 * la app), no un fondo lleno.
 */
export function NoDataDialog({
  open,
  onOpenChange,
  message,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-strong bg-surface p-5 shadow-md outline-none transition-[transform,opacity] duration-200 ease-out data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
        >
          <div className="flex items-start gap-3">
            <WarningIcon />
            <div className="min-w-0 flex-1 pt-0.5">
              <DialogPrimitive.Title className="text-sm font-semibold text-foreground">
                No hay datos para generar el reporte
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-muted">{message}</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="btn-secondary shrink-0" aria-label="Cerrar">
              ✕
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Mismo estilo lineal/outline (stroke=currentColor, strokeWidth 1.75,
// remates redondeados) que el resto de los íconos de la app (ver
// components/layout/bottom-nav.tsx) -- sin librería de íconos nueva.
function WarningIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 shrink-0 text-brand-red"
    >
      <path d="M12 3.5 21.5 20.25h-19L12 3.5Z" />
      <line x1="12" y1="9.5" x2="12" y2="13.5" />
      <circle cx="12" cy="16.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
