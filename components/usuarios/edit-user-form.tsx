"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { editUserFormSchema, type EditUserFormValues } from "@/lib/validation/user";

export function EditUserForm({
  email,
  defaultValues,
  action,
}: {
  email: string;
  defaultValues: EditUserFormValues;
  action: (values: EditUserFormValues) => Promise<{ error?: string } | void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues,
  });

  async function onSubmit(values: EditUserFormValues) {
    setFormError(null);
    const result = await action(values);
    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5" noValidate>
      <Field label="Correo">
        <input className="input" value={email} disabled />
      </Field>

      <Field label="Nombre completo" error={errors.full_name?.message}>
        <input className="input" {...register("full_name")} autoComplete="off" />
      </Field>

      <Field label="Rol" error={errors.role?.message}>
        <select className="input" {...register("role")}>
          <option value="nutricionista">Nutricionista</option>
          <option value="admin">Admin</option>
        </select>
      </Field>

      {formError && (
        <p role="alert" className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
          {formError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
