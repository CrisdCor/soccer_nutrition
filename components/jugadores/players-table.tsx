import Link from "next/link";
import { PlayerStatusToggle } from "@/components/jugadores/player-status-toggle";
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

export function PlayersTable({ players }: { players: PlayerRow[] }) {
  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
        No hay jugadores para mostrar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
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
          {players.map((player) => (
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
  );
}
