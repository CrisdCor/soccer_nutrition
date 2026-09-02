import { CatalogSection } from "@/components/catalogos/catalog-section";
import { ThresholdForm } from "@/components/configuracion/threshold-form";
import { requireProfile } from "@/lib/auth/session";
import {
  createDietType,
  createFoodGroup,
  toggleDietTypeActive,
  toggleFoodGroupActive,
  upsertThreshold,
} from "@/lib/configuracion/actions";
import { listDietTypes, listFoodGroups, listThresholds } from "@/lib/configuracion/queries";

const METRIC_LABELS: Record<string, string> = {
  skinfold_sum: "Suma 6 Pliegues",
  aks_index: "AKS",
  fat_percentage: "% de Grasa (Yuhasz)",
  weight_change_pct: "Variación de Peso (%)",
};

export default async function ConfiguracionPage() {
  const [{ profile }, thresholds, dietTypes, foodGroups] = await Promise.all([
    requireProfile(),
    listThresholds(),
    listDietTypes(),
    listFoodGroups(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const currentIdByMetric = new Map<string, string>();
  for (const threshold of thresholds) {
    if (threshold.effective_from <= today && !currentIdByMetric.has(threshold.metric)) {
      currentIdByMetric.set(threshold.metric, threshold.id);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configuración</h2>
        <p className="text-sm text-muted">
          Umbrales de referencia (solo admin) y catálogos del Plan de Alimentación (nutricionista y admin).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Umbrales de referencia</h3>
          <p className="text-sm text-muted">
            Suma 6 Pliegues, AKS, % de Grasa (Yuhasz) y Variación de Peso (día a día, usado en el tab
            &ldquo;Peso Diario&rdquo; del perfil de jugador), por organización. Un solo umbral vigente por
            métrica: guardar reemplaza el existente. Solo admin puede editarlos.
          </p>
        </div>

        {profile.role === "admin" && (
          <div className="rounded-lg border border-border bg-surface p-5">
            <ThresholdForm action={upsertThreshold} />
          </div>
        )}

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
                  <td className="px-4 py-3 text-foreground">
                    {METRIC_LABELS[threshold.metric] ?? threshold.metric}
                  </td>
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

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Catálogos del Plan de Alimentación</h3>
          <p className="text-sm text-muted">
            A diferencia de Posiciones/Categorías, cualquier rol puede crear o desactivar estos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CatalogSection
            title="Tipos de dieta"
            items={dietTypes}
            createAction={createDietType}
            toggleAction={toggleDietTypeActive}
          />
          <CatalogSection
            title="Grupos de alimentos"
            items={foodGroups}
            createAction={createFoodGroup}
            toggleAction={toggleFoodGroupActive}
          />
        </div>
      </div>
    </div>
  );
}
