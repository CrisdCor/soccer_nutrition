"use client";

import { useState, type ReactNode } from "react";
import { Field } from "@/components/ui/field";
import { saveNutritionPlan } from "@/lib/nutricion/actions";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";

type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };

type FormState = {
  nutritional_diagnosis: string;
  diet_type_ids: string[];
  diet_type_observation: string;
  energy_requirement_kcal: string;
  caloric_adjustment_direction: "deficit" | "superavit";
  caloric_adjustment_magnitude_kcal: string;
  energy_distribution_kcal: string;
  protein_g: string;
  protein_g_per_kg: string;
  fat_g: string;
  fat_g_per_kg: string;
  carbs_g: string;
  carbs_g_per_kg: string;
  general_recommendations: string;
  portions: Record<string, string>;
  menu_examples: Record<string, string>;
};

function portionKey(foodGroupId: string, mealTypeId: number): string {
  return `${foodGroupId}:${mealTypeId}`;
}

function numToStr(value: number | null): string {
  return value != null ? String(value) : "";
}

function buildInitialState(
  existingPlan: NutritionPlanFull | null,
  suggestedDiagnosis: string,
  foodGroups: CatalogOption[],
  mealTypes: MealType[]
): FormState {
  const portions: Record<string, string> = {};
  const menuExamples: Record<string, string> = {};

  for (const foodGroup of foodGroups) {
    for (const mealType of mealTypes) {
      const key = portionKey(foodGroup.id, mealType.id);
      portions[key] = numToStr(existingPlan?.portions[key] ?? 0).toString() || "0";
    }
  }
  for (const mealType of mealTypes) {
    menuExamples[String(mealType.id)] = existingPlan?.menuExamples[mealType.id] ?? "";
  }

  const adjustment = existingPlan?.caloric_adjustment_kcal ?? null;

  return {
    nutritional_diagnosis: existingPlan?.nutritional_diagnosis ?? suggestedDiagnosis,
    diet_type_ids: existingPlan?.dietTypeIds ?? [],
    diet_type_observation: existingPlan?.diet_type_observation ?? "",
    energy_requirement_kcal: numToStr(existingPlan?.energy_requirement_kcal ?? null),
    caloric_adjustment_direction: adjustment != null && adjustment > 0 ? "superavit" : "deficit",
    caloric_adjustment_magnitude_kcal: adjustment != null ? String(Math.abs(adjustment)) : "",
    energy_distribution_kcal: numToStr(existingPlan?.energy_distribution_kcal ?? null),
    protein_g: numToStr(existingPlan?.protein_g ?? null),
    protein_g_per_kg: numToStr(existingPlan?.protein_g_per_kg ?? null),
    fat_g: numToStr(existingPlan?.fat_g ?? null),
    fat_g_per_kg: numToStr(existingPlan?.fat_g_per_kg ?? null),
    carbs_g: numToStr(existingPlan?.carbs_g ?? null),
    carbs_g_per_kg: numToStr(existingPlan?.carbs_g_per_kg ?? null),
    general_recommendations: existingPlan?.general_recommendations ?? "",
    portions,
    menu_examples: menuExamples,
  };
}

export function NutritionPlanForm({
  assessmentId,
  playerId,
  dietTypes,
  foodGroups,
  mealTypes,
  existingPlan,
  suggestedDiagnosis,
  onSaved,
  onCancel,
}: {
  assessmentId: string;
  playerId: string;
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
  existingPlan: NutritionPlanFull | null;
  suggestedDiagnosis: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<FormState>(() =>
    buildInitialState(existingPlan, suggestedDiagnosis, foodGroups, mealTypes)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDietType(id: string) {
    setState((prev) => ({
      ...prev,
      diet_type_ids: prev.diet_type_ids.includes(id)
        ? prev.diet_type_ids.filter((existing) => existing !== id)
        : [...prev.diet_type_ids, id],
    }));
  }

  function updatePortion(foodGroupId: string, mealTypeId: number, value: string) {
    setState((prev) => ({
      ...prev,
      portions: { ...prev.portions, [portionKey(foodGroupId, mealTypeId)]: value },
    }));
  }

  function updateMenuExample(mealTypeId: number, value: string) {
    setState((prev) => ({
      ...prev,
      menu_examples: { ...prev.menu_examples, [String(mealTypeId)]: value },
    }));
  }

  function rowTotal(foodGroupId: string): number {
    return mealTypes.reduce((sum, mealType) => {
      const raw = state.portions[portionKey(foodGroupId, mealType.id)];
      const n = Number(raw);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }

  async function handleSubmit() {
    setError(null);
    setIsSaving(true);
    const result = await saveNutritionPlan(assessmentId, playerId, state);
    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onSaved();
  }

  return (
    <div className="space-y-8">
      <Section title="1. Diagnóstico nutricional">
        <p className="mb-2 text-xs text-muted">
          Punto de partida generado a partir de la valoración — edítalo o reescríbelo libremente.
        </p>
        <textarea
          className="input min-h-[7rem]"
          value={state.nutritional_diagnosis}
          onChange={(event) => update("nutritional_diagnosis", event.target.value)}
        />
      </Section>

      <Section title="2. Tipo de dieta">
        <div className="flex flex-wrap gap-3">
          {dietTypes.map((dietType) => (
            <label key={dietType.id} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={state.diet_type_ids.includes(dietType.id)}
                onChange={() => toggleDietType(dietType.id)}
              />
              {dietType.name}
            </label>
          ))}
          {dietTypes.length === 0 && (
            <p className="text-sm text-muted">
              No hay tipos de dieta configurados — agrégalos en Configuración.
            </p>
          )}
        </div>
        <Field label="Observación">
          <textarea
            className="input mt-2"
            placeholder="Ej. fraccionada en 5 momentos del día"
            value={state.diet_type_observation}
            onChange={(event) => update("diet_type_observation", event.target.value)}
          />
        </Field>
      </Section>

      <Section title="3. Requerimiento energético">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Requerimiento (kcal/día)">
            <input
              type="number"
              step="1"
              className="input"
              value={state.energy_requirement_kcal}
              onChange={(event) => update("energy_requirement_kcal", event.target.value)}
            />
          </Field>
          <Field label="Ajuste calórico">
            <select
              className="input"
              value={state.caloric_adjustment_direction}
              onChange={(event) =>
                update("caloric_adjustment_direction", event.target.value as "deficit" | "superavit")
              }
            >
              <option value="deficit">Déficit</option>
              <option value="superavit">Superávit</option>
            </select>
          </Field>
          <Field label="Magnitud del ajuste (kcal)">
            <input
              type="number"
              step="1"
              min="0"
              className="input"
              value={state.caloric_adjustment_magnitude_kcal}
              onChange={(event) => update("caloric_adjustment_magnitude_kcal", event.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="4. Distribución de energía y macronutrientes">
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
                <td className="px-3 py-2 text-foreground">Energía (kcal)</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="1"
                    className="input"
                    value={state.energy_distribution_kcal}
                    onChange={(event) => update("energy_distribution_kcal", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-muted">—</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-foreground">Proteína (g)</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={state.protein_g}
                    onChange={(event) => update("protein_g", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={state.protein_g_per_kg}
                    onChange={(event) => update("protein_g_per_kg", event.target.value)}
                  />
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-3 py-2 text-foreground">Grasa (g)</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={state.fat_g}
                    onChange={(event) => update("fat_g", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={state.fat_g_per_kg}
                    onChange={(event) => update("fat_g_per_kg", event.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-foreground">Carbohidratos (g)</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={state.carbs_g}
                    onChange={(event) => update("carbs_g", event.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={state.carbs_g_per_kg}
                    onChange={(event) => update("carbs_g_per_kg", event.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">
          Sin fórmula automática todavía: los valores son independientes entre sí.
        </p>
      </Section>

      <Section title="5. Porciones por grupo de alimento y comida">
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
                    <td key={mealType.id} className="px-3 py-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="input"
                        style={{ width: "5rem" }}
                        value={state.portions[portionKey(foodGroup.id, mealType.id)] ?? "0"}
                        onChange={(event) =>
                          updatePortion(foodGroup.id, mealType.id, event.target.value)
                        }
                      />
                    </td>
                  ))}
                  <td className="data px-3 py-2 font-medium text-foreground">{rowTotal(foodGroup.id)}</td>
                </tr>
              ))}
              {foodGroups.length === 0 && (
                <tr>
                  <td colSpan={mealTypes.length + 2} className="px-3 py-6 text-center text-sm text-muted">
                    No hay grupos de alimentos configurados — agrégalos en Configuración.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="6. Ejemplo de menú">
        <div className="space-y-4">
          {mealTypes.map((mealType) => (
            <Field key={mealType.id} label={mealType.name}>
              <textarea
                className="input"
                value={state.menu_examples[String(mealType.id)] ?? ""}
                onChange={(event) => updateMenuExample(mealType.id, event.target.value)}
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="7. Recomendaciones generales">
        <textarea
          className="input min-h-[6rem]"
          placeholder="Se puede redactar como lista con viñetas; se guarda como texto plano."
          value={state.general_recommendations}
          onChange={(event) => update("general_recommendations", event.target.value)}
        />
      </Section>

      {error && (
        <p role="alert" className="rounded-md border border-border-strong px-3 py-2 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} disabled={isSaving} className="btn-primary">
          {isSaving ? "Guardando…" : "Guardar plan"}
        </button>
        <button type="button" onClick={onCancel} disabled={isSaving} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-1 text-sm font-semibold text-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}
