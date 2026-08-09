"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";

/**
 * Envoltura fina de @radix-ui/react-switch -- mismo componente que
 * shadcn/ui usa como referencia de comportamiento (estructura Root/Thumb,
 * medidas h-5/w-9, border-2 transparente como truco para el inset del
 * thumb sin cálculos manuales), estilizado con el Design System propio:
 * "on" en azul institucional (--color-brand-blue, nunca verde), "off" en
 * gris neutro (--color-border-strong).
 *
 * Reemplaza los botones de texto "Activar"/"Inactivar" -- a diferencia de
 * un borrado, es una acción reversible con un clic y el propio switch ya
 * comunica el estado resultante, así que dispara la acción directo, sin
 * modal de confirmación (ver PlayerStatusToggle/UserStatusToggle/
 * CatalogSection).
 */
export function Switch({
  checked,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-60 data-[state=checked]:bg-brand-blue data-[state=unchecked]:bg-border-strong"
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-surface shadow-sm transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}
