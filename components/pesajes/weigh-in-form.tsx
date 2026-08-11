"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FilterSelect } from "@/components/ui/filter-select";
import { MobileCardList } from "@/components/ui/mobile-card-list";
import { NameSearchInput, normalizeSearchText } from "@/components/ui/name-search-input";
import { formatIndicator } from "@/lib/format";
import { recordDailyWeighIns, updateDailyWeighIn } from "@/lib/pesajes/actions";
import type { TodayWeighIn } from "@/lib/pesajes/queries";
import type { ReportPlayer } from "@/lib/dashboard/report-queries";

type CatalogOption = { id: string; name: string };
type SaveResult = { error?: string } | undefined;

/**
 * Tabla de roster (Nombre, Posición) por categoría, con filtro por nombre
 * (mismo componente/lógica que PlayersTable en /jugadores) y registro de
 * peso inline por fila -- sin lote: cada fila guarda su propio pesaje al
 * confirmarlo, con recorded_at = now() puesto por el servidor, sin campo
 * de fecha visible. Los pesajes de hoy ya registrados se listan junto al
 * nombre (puede haber más de uno, ej. entreno + partido) y cada uno es
 * clickable para corregirlo individualmente por su `id`.
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

  // Todos los de hoy por jugador, no solo el último -- ver WeighInEntryItem.
  const todayEntriesByPlayer = useMemo(() => {
    const map = new Map<string, TodayWeighIn[]>();
    for (const entry of todaysWeighIns) {
      const list = map.get(entry.player_id);
      if (list) {
        list.push(entry);
      } else {
        map.set(entry.player_id, [entry]);
      }
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
    // Refresca todaysWeighIns (Server Component) para que los avisos "Ya
    // registrado" reflejen el alta/corrección recién guardada.
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
                title={(player) => (
                  <PlayerNameCell
                    player={player}
                    todayEntries={todayEntriesByPlayer.get(player.id) ?? []}
                    onSaved={handleSaved}
                  />
                )}
                fields={[{ label: "Posición", render: (player) => player.position?.name ?? "—" }]}
                actions={(player) => <NewWeighInControl player={player} onSaved={handleSaved} />}
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
                          <PlayerNameCell
                            player={player}
                            todayEntries={todayEntriesByPlayer.get(player.id) ?? []}
                            onSaved={handleSaved}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted">{player.position?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <NewWeighInControl player={player} onSaved={handleSaved} />
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

function PlayerNameCell({
  player,
  todayEntries,
  onSaved,
}: {
  player: ReportPlayer;
  todayEntries: TodayWeighIn[];
  onSaved: () => void;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">{player.full_name}</p>
      {todayEntries.map((entry) => (
        <WeighInEntryItem key={entry.id} entry={entry} playerName={player.full_name} onSaved={onSaved} />
      ))}
    </div>
  );
}

/**
 * Un pesaje de hoy ya registrado, mostrado como texto clickable ("Ya
 * registrado: 74.3 kg hoy (HH:mm)"). Al clickearlo habilita el mismo
 * input inline que el alta nueva, precargado con el valor actual, pero
 * llama a updateDailyWeighIn() (UPDATE por id) en vez de crear un
 * registro nuevo. Si hay varios pesajes del jugador hoy, cada uno es su
 * propia instancia de este componente -- independiente de los demás.
 */
function WeighInEntryItem({
  entry,
  playerName,
  onSaved,
}: {
  entry: TodayWeighIn;
  playerName: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);

  async function handleSave(weight: number): Promise<SaveResult> {
    const result = await updateDailyWeighIn({ id: entry.id, weight_kg: weight });
    if (result?.error) return result;
    setEditing(false);
    onSaved();
    return undefined;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="block text-xs text-muted hover:text-foreground hover:underline"
      >
        Ya registrado: {formatIndicator(entry.weight_kg, 1, " kg")} hoy ({formatWeighInTime(entry.recorded_at)})
      </button>
    );
  }

  return (
    <div className="mt-1">
      <WeightInlineControl
        initialValue={String(entry.weight_kg)}
        ariaLabelSuffix={`de ${playerName}`}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
      />
    </div>
  );
}

/**
 * "+" habilita el mismo input inline, vacío, para dar de alta un pesaje
 * nuevo -- ver spec: sin panel lateral para un solo campo, sin botón de
 * lote. Guardado individual: llama a recordDailyWeighIns() con un solo
 * registro (la Server Action sigue aceptando un arreglo, acá siempre de
 * longitud 1).
 */
function NewWeighInControl({ player, onSaved }: { player: ReportPlayer; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);

  async function handleSave(weight: number): Promise<SaveResult> {
    const result = await recordDailyWeighIns([{ player_id: player.id, weight_kg: weight }]);
    if (result?.error) return result;
    setEditing(false);
    onSaved();
    return undefined;
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
    <WeightInlineControl
      ariaLabelSuffix={`de ${player.full_name}`}
      onSave={handleSave}
      onCancel={() => setEditing(false)}
    />
  );
}

/**
 * Input + ✓/× compartido entre alta nueva (NewWeighInControl) y
 * corrección de un registro existente (WeighInEntryItem) -- mismo patrón
 * visual en los dos casos, solo cambia qué hace `onSave`.
 */
function WeightInlineControl({
  initialValue = "",
  ariaLabelSuffix,
  onSave,
  onCancel,
}: {
  initialValue?: string;
  ariaLabelSuffix: string;
  onSave: (weight: number) => Promise<SaveResult>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const weight = Number(value.trim());
    if (!value.trim() || !Number.isFinite(weight) || weight <= 0) {
      setError("Peso inválido.");
      return;
    }

    startTransition(async () => {
      const result = await onSave(weight);
      if (result?.error) {
        setError(result.error);
      }
    });
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
            if (event.key === "Escape") onCancel();
          }}
          aria-label={`Peso ${ariaLabelSuffix}`}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="btn-primary px-2.5"
          aria-label={`Guardar peso ${ariaLabelSuffix}`}
        >
          {isPending ? "…" : "✓"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-2.5" aria-label="Cancelar">
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
