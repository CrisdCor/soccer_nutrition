import { WeighInForm } from "@/components/pesajes/weigh-in-form";
import { listCategories } from "@/lib/catalogos/queries";
import { listReportPlayers } from "@/lib/dashboard/report-queries";
import { listTodaysWeighIns } from "@/lib/pesajes/queries";

/**
 * "Pesajes": captura rápida de peso post-entreno/partido por categoría,
 * independiente de assessments (ver daily_weigh_ins). Reutiliza
 * listReportPlayers() del Dashboard -- ya trae exactamente lo que hace
 * falta acá (jugadores activos + categoría), sin duplicar la query.
 */
export default async function PesajesPage() {
  const [categories, players, todaysWeighIns] = await Promise.all([
    listCategories({ activeOnly: true }),
    listReportPlayers(),
    listTodaysWeighIns(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Pesajes</h2>
        <p className="text-sm text-muted">
          Registro rápido de peso post-entreno/partido. Elige una categoría y carga todo el roster de una vez.
        </p>
      </div>

      <WeighInForm categories={categories} players={players} todaysWeighIns={todaysWeighIns} />
    </div>
  );
}
