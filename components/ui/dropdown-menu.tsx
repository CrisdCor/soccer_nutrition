"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

/**
 * Envoltura fina de @radix-ui/react-dropdown-menu con el estilo del Design
 * System (superficie blanca, borde fino, sombra mínima, sin colores llenos).
 * Radix se encarga de foco/teclado/ARIA; aquí solo se aplican clases.
 */
export const Root = DropdownMenuPrimitive.Root;
export const Trigger = DropdownMenuPrimitive.Trigger;

export function Content({
  children,
  align = "end",
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        sideOffset={6}
        className="z-50 min-w-[10rem] rounded-md border border-border bg-surface p-1 shadow-sm outline-none"
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

export function Item({ children, className = "", ...props }: DropdownMenuPrimitive.DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={`flex cursor-pointer select-none items-center rounded-sm px-2.5 py-2 text-sm text-foreground outline-none transition-colors data-[highlighted]:bg-background ${className}`}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export const Separator = () => <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border" />;
