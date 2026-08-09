"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo inválido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    const supabase = createClient();

    // Mensaje genérico siempre: nunca revelar si el correo existe o no.
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setFormError("Credenciales inválidas.");
      return;
    }

    const redirectTo = searchParams.get("redirect_to") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Correo
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-red"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-brand-red">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground outline-none focus:border-brand-red"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-0 top-0 flex h-full w-9 items-center justify-center text-muted transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-brand-red">{errors.password.message}</p>}
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-hover disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

// Trazo fino (stroke, sin relleno) para que combine con el resto de la UI
// (bordes finos, sin íconos "pesados") -- no hay librería de íconos en el
// proyecto, así que se definen a mano, igual que el "✕" de Sheet.Close.
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 4.5c6.5 0 10.5 7.5 10.5 7.5a15.5 15.5 0 0 1-3.4 4.4M6.7 6.7C3.8 8.4 1.5 12 1.5 12s4 7.5 10.5 7.5c1.6 0 3-.4 4.2-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
