"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { catalogItemSchema, type CatalogItemValues } from "@/lib/validation/catalog";

type CatalogItem = { id: string; name: string; active: boolean };

export function CatalogSection({
  title,
  items,
  createAction,
  toggleAction,
}: {
  title: string;
  items: CatalogItem[];
  createAction: (values: CatalogItemValues) => Promise<{ error?: string } | void>;
  toggleAction: (id: string, active: boolean) => Promise<void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CatalogItemValues>({
    resolver: zodResolver(catalogItemSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CatalogItemValues) {
    setFormError(null);
    const result = await createAction(values);
    if (result?.error) {
      setFormError(result.error);
      return;
    }
    reset();
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>

      <ul className="mt-4 divide-y divide-border">
        {items.length === 0 && <li className="py-3 text-sm text-muted">Sin registros todavía.</li>}
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-2.5">
            <span className={item.active ? "text-sm text-foreground" : "text-sm text-muted line-through"}>
              {item.name}
            </span>
            {item.active ? (
              <ConfirmActionButton
                label="Desactivar"
                confirmTitle={`Desactivar ${title.toLowerCase()}`}
                confirmDescription={`¿Desactivar "${item.name}"? Dejará de estar disponible para elegir en jugadores nuevos. No se borra: se puede reactivar después.`}
                confirmLabel="Desactivar"
                action={() => toggleAction(item.id, false)}
              />
            ) : (
              <form action={toggleAction.bind(null, item.id, true)}>
                <button type="submit" className="btn-secondary">
                  Activar
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex items-start gap-2" noValidate>
        <div className="flex-1">
          <input className="input" placeholder="Nombre" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-brand-red">{errors.name.message}</p>}
          {formError && <p className="mt-1 text-xs text-brand-red">{formError}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          Agregar
        </button>
      </form>
    </div>
  );
}
