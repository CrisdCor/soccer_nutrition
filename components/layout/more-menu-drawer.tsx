"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

type MoreItem = { label: string; href: string };

/**
 * Drawer chico anclado abajo (no pantalla completa -- son 2-3 links, un
 * Sheet full-screen sería excesivo) para los ítems del sidebar que no
 * entran en el BottomNav de 4 posiciones. Primitiva propia en vez de
 * reusar components/ui/sheet.tsx: ese es full-screen/lateral a propósito
 * para paneles de contenido (formularios, detalle), forma distinta a la
 * de un menú corto tipo action-sheet.
 */
export function MoreMenuDrawer({ items, trigger }: { items: MoreItem[]; trigger: (isActive: boolean) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = items.some((item) => pathname.startsWith(item.href));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button type="button" className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5">
          {trigger(isActive)}
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-lg border-t border-border bg-surface p-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] outline-none transition-transform duration-200 ease-out data-[state=closed]:translate-y-full data-[state=open]:translate-y-0"
        >
          <DialogPrimitive.Title className="px-3 pb-1 pt-2 text-xs font-medium text-muted">Más</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Más opciones de navegación</DialogPrimitive.Description>
          <nav className="flex flex-col">
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-3 text-sm ${
                    active ? "bg-brand-red-soft font-medium text-brand-red" : "text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
