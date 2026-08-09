"use client";

import * as SelectPrimitive from "@radix-ui/react-select";

/**
 * Selector de filtro estilo "chip" (referencia: la barra de filtros de
 * Vercel -- "All Branches", "All Authors", etc: de ahí se toma únicamente
 * la FORMA del contenedor -- rectángulo con esquinas moderadamente
 * redondeadas, borde gris sutil, fondo blanco, ancho automático -- no sus
 * demás elementos como iconos de calendario o badges de color, que no
 * aplican acá). rounded-md, el mismo radio que .btn-primary/.btn-secondary
 * y el resto de controles compactos de la app -- no rounded-full/píldora.
 * Deliberadamente distinto de la clase .select
 * (native <select>, usada en campos de formulario reales con
 * react-hook-form: Sexo/Raza/Posición/Categoría de jugador, Rol de
 * usuario, Métrica de umbral, ajuste calórico del plan). Ahí un <select>
 * nativo sigue siendo lo correcto -- accesible, funciona con el picker
 * nativo del sistema, y visualmente encaja en una grilla de inputs de
 * formulario. Esto es para selectores que solo cambian qué se MUESTRA en
 * pantalla (filtros, selectores de vista), nunca parte de un submit.
 *
 * Radix Select en vez de reusar DropdownMenu: es semánticamente lo
 * correcto para "elegir una opción de una lista" (soporta tipeo para
 * saltar a una opción, ARIA de combobox), DropdownMenu es para menús de
 * acciones.
 */
export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className="inline-flex appearance-none items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-surface px-3.5 py-1.5 text-sm text-foreground outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue data-[state=open]:border-foreground data-[state=open]:bg-foreground data-[state=open]:text-white data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60"
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="shrink-0 transition-transform data-[state=open]:rotate-180">
          <ChevronIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          align="start"
          className="z-50 overflow-hidden rounded-md border border-border bg-surface shadow-md"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer select-none items-center justify-between gap-4 rounded-sm py-2 pl-3 pr-3 text-sm text-foreground outline-none data-[highlighted]:bg-background"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator aria-hidden>✓</SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
