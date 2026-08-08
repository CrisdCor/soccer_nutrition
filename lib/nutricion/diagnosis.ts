import { computeDisplayAge } from "@/lib/calculations";
import { classifyByThreshold, formatClassification, type ThresholdRange } from "@/lib/format";

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
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
}): string {
  const age = computeDisplayAge(input.birthDate, input.assessmentDate);

  const aksClassification = formatClassification(
    classifyByThreshold(input.aksIndex, input.thresholds.aks_index)
  ).toLowerCase();
  const fatClassification = formatClassification(
    classifyByThreshold(input.skinfoldSum6, input.thresholds.skinfold_sum)
  ).toLowerCase();

  const bmiText = input.bmi != null ? input.bmi.toFixed(2) : "dato insuficiente";
  const aksText = input.aksIndex != null ? input.aksIndex.toFixed(2) : "dato insuficiente";
  const fatText =
    input.fatPercentage != null ? `${(input.fatPercentage * 100).toFixed(1)}%` : "dato insuficiente";

  return (
    `${input.sex} de ${age} años al cual se realiza valoración nutricional presentando un peso de ` +
    `${input.weightKg} kg, talla de ${input.heightCm} cm e IMC de ${bmiText}. Se encuentra con índice ` +
    `AKS de ${aksText} clasificado como ${aksClassification}, y un porcentaje de grasa de ${fatText} ` +
    `clasificado como ${fatClassification} según Yuhasz.`
  );
}
