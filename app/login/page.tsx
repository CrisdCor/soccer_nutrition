import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión | Soccer Nutrition",
};

// Única ruta pública de la app (ver PUBLIC_ROUTES en middleware.ts).
// No tiene sidebar/header: usa el layout raíz directamente.
export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.webp"
            alt="Independiente Medellín"
            width={56}
            height={56}
            className="mb-3"
            priority
          />
          <p className="font-mono text-sm font-semibold tracking-tight text-foreground">
            SOCCER_NUTRITION
          </p>
          <p className="mt-1 text-sm text-muted">Independiente Medellín</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
