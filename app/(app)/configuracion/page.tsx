import { ThresholdForm } from "@/components/configuracion/threshold-form";
import { createThreshold } from "@/lib/configuracion/actions";
import { listThresholds } from "@/lib/configuracion/queries";

const METRIC_LABELS: Record<string, string> = {
  skinfold_sum: "Suma 6 Pliegues",
  aks_index: "AKS",
};

export default async function ConfiguracionPage() {
  const thresholds = await listThresholds();

  const today = new Date().toISOString().slice(0, 10);
  const currentIdByMetric = new Map<string, string>();
  for (const threshold of thresholds) {
    if (threshold.effective_from <= today && !currentIdByMetric.has(threshold.metric)) {
      currentIdByMetric.set(threshold.metric, threshold.id);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configuración de umbrales</h2>
        <p className="text-sm text-muted">
          Umbrales de referencia (Suma 6 Pliegues, AKS) por organización. No editables una vez
          guardados: una nueva vigencia se agrega como fila nueva, conservando el histórico.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <ThresholdForm action={createThreshold} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="px-4 py-3 font-medium">Métrica</th>
              <th className="px-4 py-3 font-medium">Umbral bajo</th>
              <th className="px-4 py-3 font-medium">Umbral alto</th>
              <th className="px-4 py-3 font-medium">Vigente desde</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {thresholds.map((threshold) => (
              <tr key={threshold.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{METRIC_LABELS[threshold.metric] ?? threshold.metric}</td>
                <td className="data px-4 py-3 text-muted">{threshold.low_cut}</td>
                <td className="data px-4 py-3 text-muted">{threshold.high_cut}</td>
                <td className="data px-4 py-3 text-muted">{threshold.effective_from}</td>
                <td className="px-4 py-3">
                  {currentIdByMetric.get(threshold.metric) === threshold.id && (
                    <span className="rounded border border-brand-blue-soft bg-brand-blue-soft px-1.5 py-0.5 text-[10px] font-medium text-brand-blue">
                      vigente
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {thresholds.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No hay umbrales configurados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
