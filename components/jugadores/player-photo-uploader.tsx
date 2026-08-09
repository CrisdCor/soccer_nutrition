"use client";

import { useActionState, useRef } from "react";
import { uploadPlayerPhoto } from "@/lib/jugadores/actions";

type UploadState = { error?: string } | null;

/**
 * Solo el círculo de la foto: sin botón ni texto de ayuda. Al pasar el
 * mouse aparece un scrim (mismo bg-black/40 que el modal de confirmación)
 * con un ícono de editar; el clic dispara el input de archivo oculto. El
 * badge de año de nacimiento (birthYear) es opcional y puramente visual --
 * no se muestra en el formulario de edición, solo en el encabezado del perfil.
 *
 * En mobile no existe :hover, así que el scrim nunca se ve por sí solo --
 * se agrega un ícono chico siempre visible en la esquina (sm:hidden, el
 * hover-reveal de desktop ya cumple ese rol de ahí en adelante) para que
 * la acción sea descubrible sin depender de que alguien toque "a ciegas".
 */
export function PlayerPhotoUploader({
  playerId,
  photoUrl,
  birthYear,
}: {
  playerId: string;
  photoUrl: string | null;
  birthYear?: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState<UploadState, FormData>(async (_prev, formData) => {
    try {
      await uploadPlayerPhoto(playerId, formData);
      return null;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "No se pudo subir la foto." };
    }
  }, null);

  return (
    <form ref={formRef} action={formAction} className="w-fit">
      <div className="relative h-24 w-24 shrink-0">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          aria-label={photoUrl ? "Cambiar foto" : "Subir foto"}
          className="group block h-24 w-24 overflow-hidden rounded-full border border-border bg-background"
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL firmada de corta duración, no vale la pena el pipeline de next/image para esto.
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">Sin foto</div>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            {isPending ? (
              <span className="text-[10px] font-medium text-white">Subiendo…</span>
            ) : (
              <EditIcon className="h-5 w-5 text-white" />
            )}
          </span>
        </button>

        {/* Ícono siempre visible en mobile (sin :hover) -- discreto, en la
            esquina, para que la acción sea descubrible sin depender del tap
            "a ciegas". De sm en adelante el hover-reveal de arriba alcanza. */}
        {!isPending && (
          <span className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface shadow-sm sm:hidden">
            <EditIcon className="h-3 w-3 text-muted" />
          </span>
        )}

        {birthYear != null && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-foreground">
            {birthYear}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={() => formRef.current?.requestSubmit()}
      />

      {state?.error && <p className="mt-1 max-w-[6rem] text-center text-xs text-brand-red">{state.error}</p>}
    </form>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
