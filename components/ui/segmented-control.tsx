"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

/**
 * Envoltura de @radix-ui/react-tabs con look de "segmented control" (pill
 * con track gris y segmento activo en blanco/sombra), distinto del
 * subrayado de components/ui/tabs.tsx -- ese es para navegación de página
 * (Valoraciones/Plan Nutricional); esto es para alternar entre vistas
 * dentro de un mismo bloque, más compacto y sin borde inferior.
 */
export const Root = TabsPrimitive.Root;
export const Content = TabsPrimitive.Content;

export function List({ children, className = "", ...props }: TabsPrimitive.TabsListProps) {
  return (
    // flex-nowrap + overflow-x-auto en vez de flex-wrap: con 5 segmentos de
    // nombre largo (las 5 visualizaciones del dashboard), envolver a varias
    // líneas se come alto útil del bloque de altura fija -- una tira
    // deslizable (con el dedo en touch, con el mouse/trackpad en desktop)
    // es el patrón estándar para un tab bar que no entra en el ancho
    // disponible, en vez de partirlo en filas.
    <TabsPrimitive.List
      className={`flex min-w-0 max-w-full flex-nowrap gap-1 overflow-x-auto rounded-md border border-border bg-background p-1 ${className}`}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function Trigger({ children, className = "", ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={`shrink-0 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm text-muted outline-none transition-colors hover:text-foreground data-[state=active]:bg-surface data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}
