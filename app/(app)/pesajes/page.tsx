import { WeighInForm } from "@/components/pesajes/weigh-in-form";
import { listCategories } from "@/lib/catalogos/queries";
import { listReportPlayers } from "@/lib/dashboard/report-queries";
import { listWeighInsForDate } from "@/lib/pesajes/queries";
import { getTodayDateStringBogota, isValidDateString } from "@/lib/pesajes/timezone";

/**
 * "Pesajes": captura rápida de peso post-entreno/partido por categoría,
 * independiente de assessments (ver daily_weigh_ins). Reutiliza
 * listReportPlayers() del Dashboard -- ya trae exactamente lo que hace
 * falta acá (jugadores activos + categoría), sin duplicar la query.
 *
 * La fecha activa vive en la URL (?date=YYYY-MM-DD), mismo patrón que los
 * filtros de categoría/sexo del Dashboard (app/(app)/dashboard/page.tsx):
 * cambiarla en el selector navega, no dispara un fetch aparte -- así el
 * Server Component sigue siendo la única fuente de los pesajes (que pueden
 * acumularse con el tiempo, a diferencia de assessments, así que no
 * conviene traerlos todos de una y filtrar en cliente).
 */
export default async function PesajesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const today = getTodayDateStringBogota();
  const date = isValidDateString(dateParam) ? dateParam : today;

  const [categories, players, weighIns] = await Promise.all([
    listCategories({ activeOnly: true }),
    listReportPlayers(),
    listWeighInsForDate(date),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Pesajes</h2>
        <p className="text-sm text-muted">
          Registro rápido de peso post-entreno/partido. Elige una categoría y carga todo el roster de una vez.
        </p>
      </div>

      <WeighInForm categories={categories} players={players} date={date} today={today} weighIns={weighIns} />
    </div>
  );
}
