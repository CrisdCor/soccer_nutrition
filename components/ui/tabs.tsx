"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

/**
 * Envoltura fina de @radix-ui/react-tabs. Estilo subrayado (mismo lenguaje
 * visual que los tabs de filtro de /jugadores), sin colores llenos: el tab
 * activo se distingue por el borde inferior rojo institucional, no por un
 * fondo de color.
 */
export const Root = TabsPrimitive.Root;
export const Content = TabsPrimitive.Content;

export function List({ children, className = "", ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List className={`flex gap-1 border-b border-border ${className}`} {...props}>
      {children}
    </TabsPrimitive.List>
  );
}

export function Trigger({ children, className = "", ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={`px-3 py-2 text-sm text-muted outline-none transition-colors hover:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-brand-red data-[state=active]:font-medium data-[state=active]:text-foreground ${className}`}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}
