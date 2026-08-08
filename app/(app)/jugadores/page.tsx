import Link from "next/link";
import { PlayersTable } from "@/components/jugadores/players-table";
import { listPlayers, type PlayerStatusFilter } from "@/lib/jugadores/queries";

const TABS: { label: string; value: PlayerStatusFilter }[] = [
  { label: "Activos", value: "active" },
  { label: "Inactivos", value: "inactive" },
  { label: "Todos", value: "all" },
];

export default async function JugadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const currentStatus: PlayerStatusFilter =
    status === "inactive" || status === "all" ? status : "active";

  const players = await listPlayers(currentStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Jugadores</h2>
          <p className="text-sm text-muted">Nunca se borran físicamente: solo se inactivan.</p>
        </div>
        <Link href="/jugadores/nuevo" className="btn-primary">
          Nuevo jugador
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/jugadores?status=${tab.value}`}
            className={[
              "px-3 py-2 text-sm",
              currentStatus === tab.value
                ? "border-b-2 border-brand-red font-medium text-foreground"
                : "text-muted hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <PlayersTable players={players} />
    </div>
  );
}
