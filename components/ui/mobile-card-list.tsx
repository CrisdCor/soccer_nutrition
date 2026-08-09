import type { ReactNode } from "react";

type CardField<T> = { label: string; render: (row: T) => ReactNode };

/**
 * Reemplazo de una <table> en mobile: una card apilada por fila (label:
 * valor, uno debajo del otro) en vez de forzar scroll horizontal en una
 * pantalla angosta. El caller sigue renderizando su <table> normal
 * envuelta en `hidden sm:block` -- esto va al lado, en `sm:hidden`, ambos
 * a partir de los mismos `rows`. No decide el layout completo por sí solo
 * a propósito (no es un <table> genérico): cada tabla define su propio
 * `title`/`fields`/`actions`, que suelen no ser un mapeo 1:1 de columnas
 * (ej. la columna "Jugador" con link+badge se vuelve el título de la
 * card, no un campo más de la lista).
 */
export function MobileCardList<T>({
  rows,
  keyFor,
  title,
  fields,
  actions,
}: {
  rows: T[];
  keyFor: (row: T) => string;
  title: (row: T) => ReactNode;
  fields: CardField<T>[];
  actions?: (row: T) => ReactNode;
}) {
  return (
    <div className="space-y-3 sm:hidden">
      {rows.map((row) => (
        <div key={keyFor(row)} className="rounded-lg border border-border bg-surface p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">{title(row)}</div>
            {actions && <div className="shrink-0">{actions(row)}</div>}
          </div>
          <dl className="mt-2 space-y-1.5">
            {fields.map((field) => (
              <div key={field.label} className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="shrink-0 text-muted">{field.label}</dt>
                <dd className="min-w-0 text-right text-foreground">{field.render(row)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
