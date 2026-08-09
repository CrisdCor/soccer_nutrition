"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { playerFormSchema, type PlayerFormValues } from "@/lib/validation/player";

type Option = { id: string | number; name: string };

type PlayerFormProps = {
  races: Option[];
  positions: Option[];
  categories: Option[];
  defaultValues?: Partial<PlayerFormValues>;
  action: (values: PlayerFormValues) => Promise<{ error?: string } | void>;
  submitLabel: string;
};

export function PlayerForm({
  races,
  positions,
  categories,
  defaultValues,
  action,
  submitLabel,
}: PlayerFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      document: "",
      full_name: "",
      birth_date: "",
      sex: "Hombre",
      home_club: false,
      ...defaultValues,
    },
  });

  async function onSubmit(values: PlayerFormValues) {
    setFormError(null);
    const result = await action(values);
    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Documento" error={errors.document?.message}>
          <input
            className="input"
            {...register("document")}
            autoComplete="off"
          />
        </Field>

        <Field label="Nombre completo" error={errors.full_name?.message}>
          <input className="input" {...register("full_name")} autoComplete="off" />
        </Field>

        <Field label="Fecha de nacimiento" error={errors.birth_date?.message}>
          <input type="date" className="input" {...register("birth_date")} />
        </Field>

        <Field label="Sexo" error={errors.sex?.message}>
          <select className="select" {...register("sex")}>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
          </select>
        </Field>

        <Field label="Raza" error={errors.race_id?.message}>
          <select className="select" {...register("race_id")}>
            <option value="">Selecciona…</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Posición">
          <select className="select" {...register("position_id")}>
            <option value="">Sin posición</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Categoría">
          <select className="select" {...register("category_id")}>
            <option value="">Sin categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex items-center gap-2 pt-6 text-sm text-foreground">
          <input type="checkbox" className="h-4 w-4" {...register("home_club")} />
          Cantera (home club)
        </label>
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-hover disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
