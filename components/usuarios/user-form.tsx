"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { createUserFormSchema, type CreateUserFormValues } from "@/lib/validation/user";

export function UserForm({
  organizationName,
  action,
}: {
  organizationName: string;
  action: (values: CreateUserFormValues) => Promise<{ error?: string } | void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { email: "", password: "", full_name: "", role: "nutricionista" },
  });

  async function onSubmit(values: CreateUserFormValues) {
    setFormError(null);
    const result = await action(values);
    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5" noValidate>
      <Field label="Organización">
        <input className="input" value={organizationName} disabled />
        <p className="mt-1 text-xs text-muted">
          Preseleccionada, no editable en este MVP (multi-club queda para más adelante).
        </p>
      </Field>

      <Field label="Nombre completo" error={errors.full_name?.message}>
        <input className="input" {...register("full_name")} autoComplete="off" />
      </Field>

      <Field label="Correo" error={errors.email?.message}>
        <input type="email" className="input" {...register("email")} autoComplete="off" />
      </Field>

      <Field label="Contraseña" error={errors.password?.message}>
        <input type="password" className="input" {...register("password")} autoComplete="new-password" />
        <p className="mt-1 text-xs text-muted">
          Compártela directamente con la persona: no hay invitación por correo en este MVP.
        </p>
      </Field>

      <Field label="Rol" error={errors.role?.message}>
        <select className="select" {...register("role")}>
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
        {isSubmitting ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
