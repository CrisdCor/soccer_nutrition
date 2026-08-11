"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilterSelect } from "@/components/ui/filter-select";
import { MobileCardList } from "@/components/ui/mobile-card-list";
import { NameSearchInput, normalizeSearchText } from "@/components/ui/name-search-input";
import { formatIndicator } from "@/lib/format";
import { recordDailyWeighIns } from "@/lib/pesajes/actions";
import type { TodayWeighIn } from "@/lib/pesajes/queries";
import type { ReportPlayer } from "@/lib/dashboard/report-queries";

type CatalogOption = { id: string; name: string };

/**
 * Tabla de roster (Nombre, Posición) por categoría, con filtro por nombre
 * (mismo componente/lógica que PlayersTable en /jugadores) y registro de
 * peso inline por fila -- sin lote: cada fila guarda su propio pesaje al
 * confirmarlo, con recorded_at = now() puesto por el servidor, sin campo
 * de fecha visible.
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
  const [search, setSearch] = useState("");

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

  const filteredPlayers = useMemo(() => {
    const needle = normalizeSearchText(search.trim());
    if (!needle) return rosterPlayers;
    return rosterPlayers.filter((player) => normalizeSearchText(player.full_name).includes(needle));
  }, [rosterPlayers, search]);

  function handleSaved() {
    // Refresca todaysWeighIns (Server Component) para que el aviso "Ya
    // registrado hoy" se actualice tras guardar una fila.
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <FilterSelect
        aria-label="Filtrar por categoría"
        value={categoryId}
        onValueChange={(value) => {
          setCategoryId(value);
          setSearch("");
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
        <div className="space-y-3">
          <NameSearchInput value={search} onChange={setSearch} />

          {filteredPlayers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
              Ningún jugador coincide con la búsqueda.
            </div>
          ) : (
            <>
              <MobileCardList
                rows={filteredPlayers}
                keyFor={(player) => player.id}
                title={(player) => <PlayerNameCell player={player} todayEntry={latestTodayByPlayer.get(player.id)} />}
                fields={[{ label: "Posición", render: (player) => player.position?.name ?? "—" }]}
                actions={(player) => <WeighInRowControl player={player} onSaved={handleSaved} />}
              />

              <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface sm:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted">
                      <th className="px-4 py-3 font-medium">Nombre</th>
                      <th className="px-4 py-3 font-medium">Posición</th>
                      <th className="px-4 py-3 font-medium" aria-label="Registrar peso" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr key={player.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3">
                          <PlayerNameCell player={player} todayEntry={latestTodayByPlayer.get(player.id)} />
                        </td>
                        <td className="px-4 py-3 text-muted">{player.position?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <WeighInRowControl player={player} onSaved={handleSaved} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerNameCell({ player, todayEntry }: { player: ReportPlayer; todayEntry: TodayWeighIn | undefined }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">{player.full_name}</p>
      {todayEntry && (
        <p className="text-xs text-muted">
          Ya registrado: {formatIndicator(todayEntry.weight_kg, 1, " kg")} hoy ({formatWeighInTime(todayEntry.recorded_at)})
        </p>
      )}
    </div>
  );
}

/**
 * "+" habilita un input inline + botón de guardar, en la misma fila --
 * ver spec: sin panel lateral para un solo campo, sin botón de lote.
 * Guardado individual: llama a recordDailyWeighIns() con un solo registro
 * (la Server Action sigue aceptando un arreglo, acá siempre de longitud 1).
 */
function WeighInRowControl({ player, onSaved }: { player: ReportPlayer; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    setEditing(false);
    setValue("");
    setError(null);
  }

  function handleSave() {
    const weight = Number(value.trim());
    if (!value.trim() || !Number.isFinite(weight) || weight <= 0) {
      setError("Peso inválido.");
      return;
    }

    startTransition(async () => {
      const result = await recordDailyWeighIns([{ player_id: player.id, weight_kg: weight }]);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setValue("");
      setError(null);
      onSaved();
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="btn-secondary"
        aria-label={`Registrar peso de ${player.full_name}`}
      >
        +
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          step="0.1"
          inputMode="decimal"
          autoFocus
          placeholder="kg"
          className="input w-20 text-right"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSave();
            if (event.key === "Escape") handleCancel();
          }}
          aria-label={`Peso de ${player.full_name}`}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary px-2.5"
          aria-label={`Guardar peso de ${player.full_name}`}
        >
          {isPending ? "…" : "✓"}
        </button>
        <button type="button" onClick={handleCancel} className="btn-secondary px-2.5" aria-label="Cancelar">
          ×
        </button>
      </div>
      {error && <span className="text-xs text-brand-red">{error}</span>}
    </div>
  );
}

function formatWeighInTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}
