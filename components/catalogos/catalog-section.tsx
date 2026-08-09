"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
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
          <CatalogItemRow key={item.id} item={item} toggleAction={toggleAction} />
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

// Fila propia (en vez de resolver el toggle inline en el .map de arriba)
// para que cada ítem tenga su propio useTransition -- si no, un solo
// isPending a nivel de CatalogSection deshabilitaría TODOS los switches de
// la lista mientras cualquiera de ellos está en vuelo.
function CatalogItemRow({
  item,
  toggleAction,
}: {
  item: CatalogItem;
  toggleAction: (id: string, active: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      await toggleAction(item.id, checked);
    });
  }

  return (
    <li className="flex items-center justify-between py-2.5">
      <span className={item.active ? "text-sm text-foreground" : "text-sm text-muted line-through"}>
        {item.name}
      </span>
      <Switch
        checked={item.active}
        onCheckedChange={handleChange}
        disabled={isPending}
        aria-label={item.active ? `Desactivar ${item.name}` : `Activar ${item.name}`}
      />
    </li>
  );
}
