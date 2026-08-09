"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

/**
 * Panel lateral (slide-over) sobre @radix-ui/react-dialog -- misma
 * primitiva que usa el Sheet de shadcn/ui, mismo comportamiento (foco
 * atrapado, cierra con Escape/clic fuera, desliza desde la derecha), pero
 * estilizado a mano con el Design System del proyecto (superficie blanca,
 * borde fino, sin colores llenos) en vez de copiar el estilo de referencia.
 * Transición vía CSS puro (translate + opacity combinados, 300ms
 * ease-out, según data-state), sin librería de animación: Radix mantiene
 * el nodo montado en data-state="closed" hasta que termina la transición,
 * así que no hace falta forceMount.
 *
 * De sm en adelante el panel "flota" (con margen respecto a los bordes
 * superior/derecho/inferior y esquinas redondeadas, como el panel "Add
 * Environment Variable" de Vercel) y desliza desde la derecha. En mobile
 * (<640px, el uso real: la nutricionista carga mediciones en la cancha
 * desde el celular) ocupa pantalla completa -- sin margen ni bordes
 * redondeados, `inset-0` a ras del viewport -- y desliza desde ABAJO en
 * vez de la derecha: se siente más nativo en mobile (mismo patrón que un
 * action sheet de iOS/Material) que un panel lateral angosto. Los dos
 * ejes de translate se resetean explícitamente en cada breakpoint (no
 * alcanza con solo agregar el otro eje) para que no queden combinados en
 * diagonal al cruzar el corte de `sm:`.
 */
export const Root = DialogPrimitive.Root;
export const Trigger = DialogPrimitive.Trigger;
export const Close = DialogPrimitive.Close;

type SheetSize = "md" | "lg" | "xl";

// "md" alcanza para los paneles de formulario/detalle de valoración (ya
// vienen en grid, se adaptan bien a ese ancho). "xl" es para el panel de
// Plan Nutricional: sus tablas (porciones × tipo de comida, macros) tienen
// más columnas y necesitan más aire para no generar scroll horizontal.
const SIZE_CLASSES: Record<SheetSize, string> = {
  md: "sm:max-w-2xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-4xl",
};

export function Content({
  children,
  className = "",
  size = "md",
  ...props
}: DialogPrimitive.DialogContentProps & { size?: SheetSize }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
      />
      <DialogPrimitive.Content
        className={`fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden bg-surface outline-none transition-[transform,opacity] duration-300 ease-out data-[state=closed]:translate-x-0 data-[state=closed]:translate-y-full data-[state=closed]:opacity-0 data-[state=open]:translate-x-0 data-[state=open]:translate-y-0 data-[state=open]:opacity-100 sm:inset-y-4 sm:left-auto sm:right-4 sm:h-auto sm:rounded-lg sm:border sm:border-border sm:shadow-md sm:data-[state=closed]:translate-y-0 sm:data-[state=closed]:translate-x-full sm:data-[state=open]:translate-x-0 ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function Header({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
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
  return <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</div>;
}
