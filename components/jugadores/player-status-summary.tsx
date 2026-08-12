import type { ReactNode } from "react";
import { formatIndicator, formatPercentage } from "@/lib/format";

type SummaryPlayer = {
  full_name: string;
  status: "active" | "inactive";
  category?: { name: string } | null;
  home_club?: boolean;
  position?: { name: string } | null;
};

type SummaryAssessment = {
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  fat_percentage: number | null;
  aks_index: number | null;
};

/**
 * Encabezado de estado general de un jugador (foto + nombre + Posición/
 * Edad/Peso/Talla + IMC/%Grasa/IAKS de su valoración más reciente) --
 * extraído de app/(app)/jugadores/[id]/page.tsx para reutilizarlo tal cual
 * en el Portal del Jugador (ver app/portal/page.tsx), en modo puramente de
 * lectura. `photoSlot`/`actionsSlot` son los únicos puntos que difieren
 * entre contextos (staff puede subir foto y tiene acciones de escritura;
 * el jugador ve una foto fija y ningún control) -- todo lo demás es el
 * mismo componente, no una copia.
 */
export function PlayerStatusSummary({
  player,
  age,
  latestAssessment,
  photoSlot,
  actionsSlot,
}: {
  player: SummaryPlayer;
  age: number;
  latestAssessment: SummaryAssessment | null;
  photoSlot: ReactNode;
  actionsSlot?: ReactNode;
}) {
  const subtitleParts = [player.category?.name, player.home_club ? "Cantera" : null].filter(
    (part): part is string => Boolean(part)
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-start gap-6">
        {photoSlot}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{player.full_name}</h2>
                {player.status === "inactive" && (
                  <span className="rounded border border-border-strong px-1.5 py-0.5 text-[10px] font-medium text-muted">
                    Inactivo
                  </span>
                )}
              </div>
              {subtitleParts.length > 0 && (
                <p className="text-sm text-muted">{subtitleParts.join(" · ")}</p>
              )}
            </div>

            {actionsSlot && <div className="flex items-center gap-3">{actionsSlot}</div>}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            <HeaderStat label="Posición" value={player.position?.name ?? "—"} />
            <HeaderStat label="Edad" value={String(age)} />
            <HeaderStat label="Peso" value={formatIndicator(latestAssessment?.weight_kg ?? null, 1, " kg")} />
            <HeaderStat label="Talla" value={formatIndicator(latestAssessment?.height_cm ?? null, 1, " cm")} />
          </div>

          <div className="mt-4 grid max-w-xs grid-cols-3 gap-x-8 border-t border-border pt-4">
            <HeaderStat label="IMC" value={formatIndicator(latestAssessment?.bmi ?? null, 2)} />
            <HeaderStat label="% Grasa" value={formatPercentage(latestAssessment?.fat_percentage ?? null)} />
            <HeaderStat label="IAKS" value={formatIndicator(latestAssessment?.aks_index ?? null, 2)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="data mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
