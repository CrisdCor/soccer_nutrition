"use client";

import { useActionState } from "react";
import { uploadPlayerPhoto } from "@/lib/jugadores/actions";

type UploadState = { error?: string } | null;

export function PlayerPhotoUploader({
  playerId,
  photoUrl,
}: {
  playerId: string;
  photoUrl: string | null;
}) {
  const [state, formAction, isPending] = useActionState<UploadState, FormData>(async (_prev, formData) => {
    try {
      await uploadPlayerPhoto(playerId, formData);
      return null;
    } catch (error) {
      return { error: error instanceof Error ? error.message : "No se pudo subir la foto." };
    }
  }, null);

  return (
    <div className="flex items-start gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-background">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL firmada de corta duración, no vale la pena el pipeline de next/image para esto.
          <img src={photoUrl} alt="Foto del jugador" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">Sin foto</div>
        )}
      </div>

      <div className="space-y-1.5">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required
            className="text-xs text-muted"
          />
          <button type="submit" disabled={isPending} className="btn-secondary">
            {isPending ? "Subiendo…" : photoUrl ? "Cambiar foto" : "Subir foto"}
          </button>
        </form>
        <p className="text-xs text-muted">JPEG, PNG o WEBP, máx. 5 MB.</p>
        {state?.error && <p className="text-xs text-brand-red">{state.error}</p>}
      </div>
    </div>
  );
}
