"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilterSelect } from "@/components/ui/filter-select";
import { formatIndicator } from "@/lib/format";
import { recordDailyWeighIns } from "@/lib/pesajes/actions";
import type { TodayWeighIn } from "@/lib/pesajes/queries";
import type { ReportPlayer } from "@/lib/dashboard/report-queries";

type CatalogOption = { id: string; name: string };

/**
 * Planilla rápida: elegir categoría -> ver el roster completo -> tipear un
 * peso por jugador -> guardar todo de una vez. Pensada para el celular en
 * la cancha (ver spec), no para pantalla grande, aunque funciona en ambas.
 *
 * Los pesos tipeados se guardan en un solo estado `weights` (por player_id,
 * no por categoría): cambiar de categoría antes de guardar solo cambia qué
 * se MUESTRA, nunca borra lo ya tipeado en otra -- y "Guardar pesajes"
 * manda TODO lo que haya en `weights`, no solo la categoría visible en ese
 * momento, para no perder datos por un cambio de categoría accidental.
 */
export function WeighInForm({
  categories,
  players,
  todaysWeighIns,
}: {
  categories: CatalogOption[];
  players: ReportPlayer[];
  todaysWeighIns: TodayWeighIn[];
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Ascendente por fecha (ver listTodaysWeighIns): el último de cada
  // jugador en el Map es el más reciente.
  const latestTodayByPlayer = useMemo(() => {
    const map = new Map<string, TodayWeighIn>();
    for (const entry of todaysWeighIns) {
      map.set(entry.player_id, entry);
    }
    return map;
  }, [todaysWeighIns]);

  const rosterPlayers = useMemo(
    () => players.filter((player) => player.category?.id === categoryId),
    [players, categoryId]
  );

  const filledCount = Object.values(weights).filter((value) => value.trim() !== "").length;

  function handleWeightChange(playerId: string, value: string) {
    setWeights((prev) => ({ ...prev, [playerId]: value }));
    setFeedback(null);
  }

  function handleSave() {
    const entries = Object.entries(weights)
      .map(([player_id, raw]) => ({ player_id, raw: raw.trim() }))
      .filter(({ raw }) => raw !== "")
      .map(({ player_id, raw }) => ({ player_id, weight_kg: Number(raw) }));

    const invalid = entries.find((entry) => !Number.isFinite(entry.weight_kg) || entry.weight_kg <= 0);
    if (invalid) {
      setFeedback({ type: "error", message: "Hay un peso inválido -- revisa los valores ingresados." });
      return;
    }

    if (entries.length === 0) {
      setFeedback({ type: "error", message: "Ingresa al menos un peso antes de guardar." });
      return;
    }

    startTransition(async () => {
      const result = await recordDailyWeighIns(entries);
      if (result?.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      setWeights({});
      setFeedback({ type: "success", message: `Se guardaron ${result?.count ?? entries.length} pesajes.` });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <FilterSelect
        aria-label="Filtrar por categoría"
        value={categoryId}
        onValueChange={(value) => {
          setCategoryId(value);
          setFeedback(null);
        }}
        placeholder="Selecciona una categoría"
        options={categories.map((category) => ({ value: category.id, label: category.name }))}
      />

      {!categoryId ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
          Selecciona una categoría para ver el roster.
        </div>
      ) : rosterPlayers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
          No hay jugadores activos en esta categoría.
        </div>
      ) : (
        <>
          <div className="divide-y divide-border rounded-lg border border-border bg-surface">
            {rosterPlayers.map((player) => {
              const todayEntry = latestTodayByPlayer.get(player.id);
              return (
                <div key={player.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{player.full_name}</p>
                    {todayEntry && (
                      <p className="text-xs text-muted">
                        Ya registrado hoy: {formatIndicator(todayEntry.weight_kg, 1, " kg")} (
                        {formatWeighInTime(todayEntry.recorded_at)})
                      </p>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="kg"
                    className="input w-24 shrink-0 text-right"
                    value={weights[player.id] ?? ""}
                    onChange={(event) => handleWeightChange(player.id, event.target.value)}
                    aria-label={`Peso de ${player.full_name}`}
                  />
                </div>
              );
            })}
          </div>

          {feedback && (
            <p
              role="alert"
              className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground"
            >
              {feedback.message}
            </p>
          )}

          <button type="button" onClick={handleSave} disabled={isPending} className="btn-primary w-full">
            {isPending ? "Guardando…" : filledCount > 0 ? `Guardar pesajes (${filledCount})` : "Guardar pesajes"}
          </button>
        </>
      )}
    </div>
  );
}

function formatWeighInTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
