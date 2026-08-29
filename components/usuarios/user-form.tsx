"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field } from "@/components/ui/field";
import { PlayerSearchSelect } from "@/components/ui/player-search-select";
import { createUserFormSchema, type CreateUserFormValues } from "@/lib/validation/user";

type PlayerOption = { id: string; full_name: string };

export function UserForm({
  organizationName,
  players,
  action,
}: {
  organizationName: string;
  /** Jugadores activos sin cuenta vinculada todavía -- ver listLinkablePlayers(). */
  players: PlayerOption[];
  action: (values: CreateUserFormValues) => Promise<{ error?: string } | void>;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { email: "", password: "", full_name: "", role: "nutricionista", player_id: "" },
  });

  const role = watch("role");

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
          <option value="lider">Líder</option>
          <option value="jugador">Jugador</option>
        </select>
      </Field>

      {/* Solo para role='jugador' -- no un <Field> (el id que clonaría no
          llega al input real dentro de PlayerSearchSelect, mismo criterio
          que otros controles compuestos de la app, ver
          ResetPasswordModal). */}
      {role === "jugador" && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Jugador vinculado</p>
          {players.length === 0 ? (
            <p className="text-sm text-muted">
              No hay jugadores activos sin cuenta vinculada todavía.
            </p>
          ) : (
            <Controller
              name="player_id"
              control={control}
              render={({ field }) => (
                <PlayerSearchSelect players={players} value={field.value ?? ""} onChange={field.onChange} />
              )}
            />
          )}
          {errors.player_id && <p className="text-xs text-brand-red">{errors.player_id.message}</p>}
        </div>
      )}

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
