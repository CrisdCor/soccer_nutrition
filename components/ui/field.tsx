import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

/**
 * Asocia label <-> control vía htmlFor/id (useId, estable en SSR/hidratación)
 * en vez de solo dejarlos adyacentes visualmente. Antes no había asociación
 * programática, lo que además de ser un gap de accesibilidad rompía
 * `getByLabel()` en Playwright para casi todos los formularios de la app
 * (Jugadores, Valoraciones, Usuarios, Umbrales) -- ver e2e/.
 */
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id: generatedId })
    : children;

  return (
    <div className="space-y-1.5">
      <label htmlFor={generatedId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {child}
      {error && <p className="text-xs text-brand-red">{error}</p>}
    </div>
  );
}
