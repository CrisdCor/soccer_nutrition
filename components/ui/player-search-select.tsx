"use client";

import { useMemo, useState } from "react";
import { NameSearchInput, normalizeSearchText } from "@/components/ui/name-search-input";

type PlayerOption = { id: string; full_name: string };

/**
 * Combobox buscable para elegir UN jugador por nombre -- reutiliza
 * NameSearchInput (mismo filtro por nombre que /jugadores) con una lista
 * desplegable de resultados debajo. Extraído de components/usuarios/
 * (donde nació para vincular una cuenta role='jugador' a su player_id)
 * porque el generador de reportes PDF (modo Individual) necesita
 * exactamente el mismo control -- un solo componente, no una copia por
 * cada lugar que elige un jugador.
 *
 * onMouseDown+preventDefault en cada opción evita que el input pierda
 * foco (y dispare su blur) antes de que el click de selección se
 * registre.
 */
export function PlayerSearchSelect({
  players,
  value,
  onChange,
}: {
  players: PlayerOption[];
  value: string;
  onChange: (playerId: string) => void;
}) {
  const selected = players.find((player) => player.id === value) ?? null;
  const [query, setQuery] = useState(selected?.full_name ?? "");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = normalizeSearchText(query.trim());
    if (!needle) return players;
    return players.filter((player) => normalizeSearchText(player.full_name).includes(needle));
  }, [players, query]);

  function handleQueryChange(next: string) {
    setQuery(next);
    setOpen(true);
    if (value) onChange(""); // la selección previa queda invalidada hasta elegir de nuevo
  }

  function handleSelect(player: PlayerOption) {
    onChange(player.id);
    setQuery(player.full_name);
    setOpen(false);
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <NameSearchInput
        value={query}
        onChange={handleQueryChange}
        placeholder="Buscar jugador por nombre…"
        aria-label="Jugador"
      />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-surface shadow-md">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">Sin resultados.</li>
          ) : (
            filtered.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(player)}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-background"
                >
                  {player.full_name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
