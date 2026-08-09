"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlayerStatusToggle } from "@/components/jugadores/player-status-toggle";
import { FilterSelect } from "@/components/ui/filter-select";
import { MobileCardList } from "@/components/ui/mobile-card-list";
import { computeDisplayAge } from "@/lib/calculations";

type PlayerRow = {
  id: string;
  document: string;
  full_name: string;
  birth_date: string;
  sex: "Hombre" | "Mujer";
  home_club: boolean;
  status: "active" | "inactive";
  position: { name: string } | null;
  category: { name: string } | null;
};

const ALL = "__all__";

// Sin acentos/mayúsculas: para que "jose" encuentre "José" -- normalize()
// separa los diacríticos en marcas combinables (\p{Diacritic}) y las quita.
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function PlayersTable({ players }: { players: PlayerRow[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [position, setPosition] = useState(ALL);
  const [sex, setSex] = useState(ALL);

  const categoryOptions = useMemo(
    () => uniqueNames(players.map((p) => p.category?.name)),
    [players]
  );
  const positionOptions = useMemo(
    () => uniqueNames(players.map((p) => p.position?.name)),
    [players]
  );

  const filtered = useMemo(() => {
    const needle = normalize(search.trim());
    return players.filter((player) => {
      if (needle && !normalize(player.full_name).includes(needle)) return false;
      if (category !== ALL && player.category?.name !== category) return false;
      if (position !== ALL && player.position?.name !== position) return false;
      if (sex !== ALL && player.sex !== sex) return false;
      return true;
    });
  }, [players, search, category, position, sex]);

  const hasActiveFilters = search.trim() !== "" || category !== ALL || position !== ALL || sex !== ALL;

  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
        No hay jugadores para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          className="input max-w-xs"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <FilterSelect
          aria-label="Filtrar por categoría"
          value={category}
          onValueChange={setCategory}
          options={[
            { value: ALL, label: "Todas las categorías" },
            ...categoryOptions.map((name) => ({ value: name, label: name })),
          ]}
        />
        <FilterSelect
          aria-label="Filtrar por posición"
          value={position}
          onValueChange={setPosition}
          options={[
            { value: ALL, label: "Todas las posiciones" },
            ...positionOptions.map((name) => ({ value: name, label: name })),
          ]}
        />
        <FilterSelect
          aria-label="Filtrar por sexo"
          value={sex}
          onValueChange={setSex}
          options={[
            { value: ALL, label: "Todos los sexos" },
            { value: "Hombre", label: "Hombre" },
            { value: "Mujer", label: "Mujer" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
          {hasActiveFilters
            ? "Ningún jugador coincide con los filtros aplicados."
            : "No hay jugadores para mostrar."}
        </div>
      ) : (
        <>
          <MobileCardList
            rows={filtered}
            keyFor={(player) => player.id}
            title={(player) => (
              <>
                <Link href={`/jugadores/${player.id}`} className="font-medium text-foreground hover:underline">
                  {player.full_name}
                </Link>
                {player.home_club && (
                  <span className="ml-2 rounded border border-brand-blue-soft bg-brand-blue-soft px-1.5 py-0.5 text-[10px] font-medium text-brand-blue">
                    cantera
                  </span>
                )}
              </>
            )}
            fields={[
              { label: "Documento", render: (player) => <span className="data">{player.document}</span> },
              {
                label: "Edad",
                render: (player) => <span className="data">{computeDisplayAge(new Date(player.birth_date))}</span>,
              },
              { label: "Sexo", render: (player) => player.sex },
              { label: "Posición", render: (player) => player.position?.name ?? "—" },
              { label: "Categoría", render: (player) => player.category?.name ?? "—" },
            ]}
            actions={(player) => (
              <PlayerStatusToggle playerId={player.id} playerName={player.full_name} status={player.status} />
            )}
          />

          <div className="hidden overflow-x-auto rounded-lg border border-border bg-surface sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Jugador</th>
                  <th className="px-4 py-3 font-medium">Documento</th>
                  <th className="px-4 py-3 font-medium">Edad</th>
                  <th className="px-4 py-3 font-medium">Sexo</th>
                  <th className="px-4 py-3 font-medium">Posición</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((player) => (
                  <tr key={player.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/jugadores/${player.id}`} className="font-medium text-foreground hover:underline">
                        {player.full_name}
                      </Link>
                      {player.home_club && (
                        <span className="ml-2 rounded border border-brand-blue-soft bg-brand-blue-soft px-1.5 py-0.5 text-[10px] font-medium text-brand-blue">
                          cantera
                        </span>
                      )}
                    </td>
                    <td className="data px-4 py-3 text-muted">{player.document}</td>
                    <td className="data px-4 py-3 text-muted">
                      {computeDisplayAge(new Date(player.birth_date))}
                    </td>
                    <td className="px-4 py-3 text-muted">{player.sex}</td>
                    <td className="px-4 py-3 text-muted">{player.position?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{player.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <PlayerStatusToggle
                        playerId={player.id}
                        playerName={player.full_name}
                        status={player.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function uniqueNames(names: (string | undefined)[]): string[] {
  const set = new Set(names.filter((name): name is string => Boolean(name)));
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}
