import { computeDisplayAge } from "@/lib/calculations";
import type { DiagnosisThresholds } from "@/lib/configuracion/queries";
import { classifyByThreshold, formatClassification, formatFatPercentageClassification } from "@/lib/format";

/**
 * Párrafo inicial sugerido al crear un plan (solo punto de partida: la
 * nutricionista lo edita o reescribe libremente después; no bloquea el
 * guardado si lo borra). Función pura, testeable por separado, igual que
 * las de lib/calculations.
 */
export function buildSuggestedDiagnosis(input: {
  sex: "Hombre" | "Mujer";
  birthDate: Date;
  assessmentDate: Date;
  weightKg: number;
  heightCm: number;
  bmi: number | null;
  aksIndex: number | null;
  skinfoldSum6: number | null;
  fatPercentage: number | null;
  thresholds: DiagnosisThresholds;
}): string {
  const age = computeDisplayAge(input.birthDate, input.assessmentDate);

  // AKS: sin cambios, mismo criterio/etiquetas de siempre. %Grasa: umbral
  // propio (`fat_percentage`) contra el propio porcentaje -- ya no reusa el
  // umbral de Suma 6 Pliegues (ver lib/format.ts).
  const aksClassification = formatClassification(
    classifyByThreshold(input.aksIndex, input.thresholds.aks_index)
  ).toLowerCase();
  const fatClassification = formatFatPercentageClassification(
    classifyByThreshold(input.fatPercentage, input.thresholds.fat_percentage)
  ).toLowerCase();

  const bmiText = input.bmi != null ? input.bmi.toFixed(2) : "—";
  const aksText = input.aksIndex != null ? input.aksIndex.toFixed(2) : "—";
  const fatText = input.fatPercentage != null ? `${(input.fatPercentage * 100).toFixed(1)}%` : "—";

  return (
    `${input.sex} de ${age} años al cual se realiza valoración nutricional presentando un peso de ` +
    `${input.weightKg} kg, talla de ${input.heightCm} cm e IMC de ${bmiText}. Se encuentra con índice ` +
    `AKS de ${aksText} clasificado como ${aksClassification}, y un porcentaje de grasa de ${fatText} ` +
    `clasificado como ${fatClassification} según Yuhasz.`
  );
}
