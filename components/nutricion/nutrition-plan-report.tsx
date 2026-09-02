import type { ReactNode } from "react";
import { formatIndicator } from "@/lib/format";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";

type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };

/**
 * Vista de solo lectura del plan, con el mismo layout visual del PDF de
 * referencia: secciones tituladas, tabla de porciones clara, texto legible.
 * Pensada para pantalla completa (eventualmente exportable/proyectable a
 * directivas) -- no como un formulario crudo.
 */
export function NutritionPlanReport({
  plan,
  dietTypes,
  foodGroups,
  mealTypes,
}: {
  plan: NutritionPlanFull;
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
}) {
  const dietTypeNames = plan.dietTypeIds
    .map((id) => dietTypes.find((d) => d.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const rowTotal = (foodGroupId: string) =>
    mealTypes.reduce((sum, mealType) => sum + (plan.portions[`${foodGroupId}:${mealType.id}`] ?? 0), 0);

  const adjustmentLabel =
    plan.caloric_adjustment_kcal == null
      ? null
      : plan.caloric_adjustment_kcal < 0
        ? `Déficit de ${Math.abs(plan.caloric_adjustment_kcal)} kcal`
        : `Superávit de ${plan.caloric_adjustment_kcal} kcal`;

  return (
    <div className="space-y-8">
      <ReportSection title="Diagnóstico nutricional">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {plan.nutritional_diagnosis || "Sin diagnóstico registrado."}
        </p>
      </ReportSection>

      <ReportSection title="Tipo de dieta">
        {dietTypeNames.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dietTypeNames.map((name) => (
              <span
                key={name}
                className="rounded border border-brand-blue-soft bg-brand-blue-soft px-2 py-1 text-xs font-medium text-brand-blue"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sin tipo de dieta seleccionado.</p>
        )}
        {plan.diet_type_observation && (
          <p className="mt-2 text-sm text-muted">{plan.diet_type_observation}</p>
        )}
      </ReportSection>

      <ReportSection title="Requerimiento energético">
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Requerimiento" value={formatIndicator(plan.energy_requirement_kcal, 0, " kcal/día")} />
          <Stat label="Ajuste calórico" value={adjustmentLabel ?? "—"} />
        </div>
      </ReportSection>

      <ReportSection title="Distribución de energía y macronutrientes">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="px-3 py-2 font-medium">Componente</th>
                <th className="px-3 py-2 font-medium">Gramos / kcal</th>
                <th className="px-3 py-2 font-medium">g / kg</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-foreground">Energía</td>
                <td className="data px-3 py-2 text-foreground">
                  {formatIndicator(plan.energy_distribution_kcal, 0, " kcal")}
                </td>
                <td className="px-3 py-2 text-muted">—</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-foreground">Proteína</td>
                <td className="data px-3 py-2 text-foreground">{formatIndicator(plan.protein_g, 1, " g")}</td>
                <td className="data px-3 py-2 text-foreground">{formatIndicator(plan.protein_g_per_kg, 2)}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-foreground">Grasa</td>
                <td className="data px-3 py-2 text-foreground">{formatIndicator(plan.fat_g, 1, " g")}</td>
                <td className="data px-3 py-2 text-foreground">{formatIndicator(plan.fat_g_per_kg, 2)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-foreground">Carbohidratos</td>
                <td className="data px-3 py-2 text-foreground">{formatIndicator(plan.carbs_g, 1, " g")}</td>
                <td className="data px-3 py-2 text-foreground">{formatIndicator(plan.carbs_g_per_kg, 2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ReportSection>

      <ReportSection title="Porciones por grupo de alimento y comida">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="px-3 py-2 font-medium">Grupo de alimento</th>
                {mealTypes.map((mealType) => (
                  <th key={mealType.id} className="px-3 py-2 font-medium">
                    {mealType.name}
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Porciones</th>
              </tr>
            </thead>
            <tbody>
              {foodGroups.map((foodGroup) => (
                <tr key={foodGroup.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-foreground">{foodGroup.name}</td>
                  {mealTypes.map((mealType) => (
                    <td key={mealType.id} className="data px-3 py-2 text-muted">
                      {plan.portions[`${foodGroup.id}:${mealType.id}`] ?? 0}
                    </td>
                  ))}
                  <td className="data px-3 py-2 font-medium text-foreground">{rowTotal(foodGroup.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSection>

      <ReportSection title="Ejemplo de menú">
        <div className="grid gap-4 sm:grid-cols-2">
          {mealTypes.map((mealType) => (
            <div key={mealType.id} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-xs font-medium text-muted">{mealType.name}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {plan.menuExamples[mealType.id] || "Sin ejemplo registrado."}
              </p>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Recomendaciones generales">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {plan.general_recommendations || "Sin recomendaciones registradas."}
        </p>
      </ReportSection>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="data mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
