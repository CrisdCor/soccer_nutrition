"use client";

import { useState, useTransition } from "react";
import { Field } from "@/components/ui/field";
import * as Sheet from "@/components/ui/sheet";
import { generateTemporaryPassword } from "@/lib/usuarios/generate-password";
import { resetUserPassword } from "@/lib/usuarios/actions";

/**
 * "Modal simple" del spec -- reutiliza el Sheet (única primitiva de panel
 * modal del Design System) en vez de sumar un componente de diálogo nuevo.
 * Sin flujo de email: el admin genera o escribe la contraseña, la confirma,
 * y es responsable de comunicarla por fuera de la app.
 */
export function ResetPasswordModal({
  userId,
  userName,
  open,
  onOpenChange,
}: {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setPassword(generateTemporaryPassword());
    setCopied(false);
    setError(null);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setError("No se pudo copiar. Selecciona y copia el texto manualmente.");
    }
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await resetUserPassword(userId, { password });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  // Se resetea el estado local recién al cerrar (no en cada render): así la
  // contraseña generada sigue visible mientras el panel está abierto, y
  // desaparece de la UI (y de la memoria del componente) al cerrarlo.
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setPassword("");
      setCopied(false);
      setError(null);
      setSuccess(false);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Sheet.Root open={open} onOpenChange={handleOpenChange}>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Restablecer contraseña</Sheet.Title>
          <Sheet.Description>{userName}</Sheet.Description>
        </Sheet.Header>
        <Sheet.Body>
          {success ? (
            <div className="space-y-4">
              <p className="text-sm text-foreground">
                Contraseña actualizada. Comunícasela a {userName} por fuera de la app (WhatsApp, en persona,
                etc.) -- no vuelve a mostrarse después de cerrar este panel.
              </p>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
                <p className="data text-sm font-semibold text-foreground">{password}</p>
                <button type="button" onClick={handleCopy} className="btn-secondary shrink-0">
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <button type="button" onClick={() => handleOpenChange(false)} className="btn-primary w-full">
                Cerrar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button type="button" onClick={handleGenerate} className="btn-secondary w-full">
                Generar contraseña temporal
              </button>

              <Field label="Contraseña" error={error ?? undefined}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input data flex-1"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setCopied(false);
                    }}
                    placeholder="Generá una arriba o escribí una acá"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!password}
                    className="btn-secondary shrink-0"
                  >
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted">Mínimo 8 caracteres.</p>
              </Field>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending || password.length < 8}
                className="btn-primary w-full"
              >
                {isPending ? "Restableciendo…" : "Restablecer contraseña"}
              </button>
            </div>
          )}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  );
}
