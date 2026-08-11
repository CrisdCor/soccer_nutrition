"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DateInput } from "@/components/ui/date-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { MobileCardList } from "@/components/ui/mobile-card-list";
import { NameSearchInput, normalizeSearchText } from "@/components/ui/name-search-input";
import { formatIndicator } from "@/lib/format";
import { deleteDailyWeighIn, recordDailyWeighIns, updateDailyWeighIn } from "@/lib/pesajes/actions";
import type { WeighInRecord } from "@/lib/pesajes/queries";
import type { ReportPlayer } from "@/lib/dashboard/report-queries";

type CatalogOption = { id: string; name: string };
type SaveResult = { error?: string } | undefined;

/**
 * Tabla de roster (Nombre, Posición) por categoría, con filtro por nombre
 * (mismo componente/lógica que PlayersTable en /jugadores), un selector de
 * fecha (default hoy) y registro de peso inline por fila -- sin lote: cada
 * fila guarda su propio pesaje al confirmarlo, con recorded_at construido
 * a partir de la fecha activa (ver lib/pesajes/timezone.ts), sin campo de
 * fecha/hora aparte en el formulario. Los pesajes ya registrados en la
 * fecha activa se listan junto al nombre (puede haber más de uno, ej.
 * entreno + partido) y cada uno es clickable para corregirlo o borrarlo
 * individualmente por su `id`.
 */
export function WeighInForm({
  categories,
  players,
  date,
  today,
  weighIns,
}: {
  categories: CatalogOption[];
  players: ReportPlayer[];
  /** "YYYY-MM-DD" activo (ver ?date= en la URL). */
  date: string;
  /** "YYYY-MM-DD" de hoy en Bogotá -- para decidir el texto "hoy" vs. la fecha. */
  today: string;
  weighIns: WeighInRecord[];
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [isNavigating, startNavigation] = useTransition();
  const isToday = date === today;

  const entriesByPlayer = useMemo(() => {
    const map = new Map<string, WeighInRecord[]>();
    for (const entry of weighIns) {
      const list = map.get(entry.player_id);
      if (list) {
        list.push(entry);
      } else {
        map.set(entry.player_id, [entry]);
      }
    }
    return map;
  }, [weighIns]);

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
    // Refresca weighIns (Server Component) para que los avisos reflejen el
    // alta/corrección/borrado recién guardado.
    router.refresh();
  }

  function handleDateChange(nextDate: string) {
    startNavigation(() => {
      router.push(`/pesajes?date=${nextDate}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
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

        <DateInput
          label="Fecha"
          aria-label="Fecha de los pesajes"
          value={date}
          max={today}
          onChange={handleDateChange}
        />
        {isNavigating && <span className="text-xs text-muted">Cargando…</span>}
      </div>

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
                    entries={entriesByPlayer.get(player.id) ?? []}
                    isToday={isToday}
                    onSaved={handleSaved}
                  />
                )}
                fields={[{ label: "Posición", render: (player) => player.position?.name ?? "—" }]}
                actions={(player) => <NewWeighInControl player={player} date={date} onSaved={handleSaved} />}
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
                            entries={entriesByPlayer.get(player.id) ?? []}
                            isToday={isToday}
                            onSaved={handleSaved}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted">{player.position?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <NewWeighInControl player={player} date={date} onSaved={handleSaved} />
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
  entries,
  isToday,
  onSaved,
}: {
  player: ReportPlayer;
  entries: WeighInRecord[];
  isToday: boolean;
  onSaved: () => void;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">{player.full_name}</p>
      {entries.map((entry) => (
        <WeighInEntryItem
          key={entry.id}
          entry={entry}
          playerName={player.full_name}
          isToday={isToday}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}

/**
 * Un pesaje ya registrado en la fecha activa, mostrado como texto
 * clickable ("Ya registrado: 74.3 kg hoy (HH:mm)", o "Registrado: 74.3 kg
 * el 10/08 (HH:mm)" si la fecha activa no es hoy). Al clickearlo habilita
 * el mismo input inline que el alta nueva, precargado con el valor
 * actual, con un botón extra para borrar el registro. Si hay varios
 * pesajes del jugador en la fecha, cada uno es su propia instancia de
 * este componente, independiente de las demás.
 */
function WeighInEntryItem({
  entry,
  playerName,
  isToday,
  onSaved,
}: {
  entry: WeighInRecord;
  playerName: string;
  isToday: boolean;
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

  async function handleDelete(): Promise<SaveResult> {
    const result = await deleteDailyWeighIn({ id: entry.id });
    if (result?.error) return result;
    // Sin setEditing(false): tras el refresh, esta entrada ya no está en
    // `entries` y el componente se desmonta solo.
    onSaved();
    return undefined;
  }

  if (!editing) {
    const label = isToday
      ? `Ya registrado: ${formatIndicator(entry.weight_kg, 1, " kg")} hoy (${formatWeighInTime(entry.recorded_at)})`
      : `Registrado: ${formatIndicator(entry.weight_kg, 1, " kg")} el ${formatWeighInDate(entry.recorded_at)} (${formatWeighInTime(entry.recorded_at)})`;

    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="block text-xs text-muted hover:text-foreground hover:underline"
      >
        {label}
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
        onDelete={handleDelete}
      />
    </div>
  );
}

/**
 * "+" habilita el mismo input inline, vacío, para dar de alta un pesaje
 * nuevo en la fecha activa -- ver spec: sin panel lateral para un solo
 * campo, sin botón de lote. Guardado individual: llama a
 * recordDailyWeighIns() con un solo registro (la Server Action sigue
 * aceptando un arreglo, acá siempre de longitud 1).
 */
function NewWeighInControl({
  player,
  date,
  onSaved,
}: {
  player: ReportPlayer;
  date: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);

  async function handleSave(weight: number): Promise<SaveResult> {
    const result = await recordDailyWeighIns({ date, entries: [{ player_id: player.id, weight_kg: weight }] });
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
 * visual en los dos casos, solo cambia qué hace `onSave`. `onDelete` es
 * opcional: solo lo pasa WeighInEntryItem (un alta nueva todavía no tiene
 * `id`, nada que borrar).
 */
function WeightInlineControl({
  initialValue = "",
  ariaLabelSuffix,
  onSave,
  onCancel,
  onDelete,
}: {
  initialValue?: string;
  ariaLabelSuffix: string;
  onSave: (weight: number) => Promise<SaveResult>;
  onCancel: () => void;
  onDelete?: () => Promise<SaveResult>;
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
        {onDelete && <DeleteControl ariaLabelSuffix={ariaLabelSuffix} onDelete={onDelete} />}
      </div>
      {error && <span className="text-xs text-brand-red">{error}</span>}
    </div>
  );
}

/**
 * Confirmación en dos pasos sin modal: el primer clic muestra
 * "Confirmar"/"Cancelar" en vez de borrar directo -- es la única acción de
 * la app que hace un DELETE físico de verdad (el resto solo cambia
 * `status`, ver setPlayerStatus/setUserStatus), así que un solo ícono sin
 * ningún paso de confirmación se sintió arriesgado para algo irreversible.
 */
function DeleteControl({
  ariaLabelSuffix,
  onDelete,
}: {
  ariaLabelSuffix: string;
  onDelete: () => Promise<SaveResult>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await onDelete();
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
      // Sin else: en éxito, el padre desmonta este control al refrescar.
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn-secondary px-2 text-muted"
        aria-label={`Borrar peso ${ariaLabelSuffix}`}
      >
        <TrashIcon />
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="btn-primary px-2 text-xs"
        aria-label={`Confirmar borrado ${ariaLabelSuffix}`}
      >
        {isPending ? "…" : "Confirmar"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="btn-secondary px-2 text-xs">
        Cancelar
      </button>
      {error && <span className="text-xs text-brand-red">{error}</span>}
    </span>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
    </svg>
  );
}

function formatWeighInTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function formatWeighInDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" });
}
