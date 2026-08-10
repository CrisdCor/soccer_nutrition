import { formatIndicator, formatPercentage } from "@/lib/format";
import type { ReportAssessment } from "@/lib/reportes/queries";

export type MeasurementField = { label: string; value: string };
export type MeasurementGroup = { title: string; fields: MeasurementField[] };

/**
 * Mismos 4 grupos y las mismas etiquetas/unidades que
 * components/valoraciones/assessment-detail-groups.tsx (AssessmentDetailGroups)
 * -- se replica el layout de impresión, no la lógica de cálculo: los valores
 * ya vienen calculados en la fila de `assessments`.
 */
export function buildMeasurementGroups(assessment: ReportAssessment): MeasurementGroup[] {
  return [
    {
      title: "Medidas capturadas",
      fields: [
        { label: "Peso", value: formatIndicator(assessment.weight_kg, 1, " kg") },
        { label: "Talla", value: formatIndicator(assessment.height_cm, 1, " cm") },
        { label: "Talla sentado", value: formatIndicator(assessment.sitting_height_cm, 1, " cm") },
        { label: "Envergadura", value: formatIndicator(assessment.wingspan_cm, 1, " cm") },
      ],
    },
    {
      title: "Pliegues cutáneos",
      fields: [
        { label: "Tríceps", value: formatIndicator(assessment.skinfold_triceps, 1, " mm") },
        { label: "Subescapular", value: formatIndicator(assessment.skinfold_subscapular, 1, " mm") },
        { label: "Bíceps", value: formatIndicator(assessment.skinfold_biceps, 1, " mm") },
        { label: "Cresta ilíaca", value: formatIndicator(assessment.skinfold_iliac_crest, 1, " mm") },
        { label: "Supraespinal", value: formatIndicator(assessment.skinfold_supraspinal, 1, " mm") },
        { label: "Abdominal", value: formatIndicator(assessment.skinfold_abdominal, 1, " mm") },
        { label: "Muslo", value: formatIndicator(assessment.skinfold_thigh, 1, " mm") },
        { label: "Pierna", value: formatIndicator(assessment.skinfold_calf, 1, " mm") },
      ],
    },
    {
      title: "Perímetros y diámetros",
      fields: [
        { label: "Brazo relajado", value: formatIndicator(assessment.girth_relaxed_arm, 1, " cm") },
        { label: "Brazo flexionado", value: formatIndicator(assessment.girth_flexed_arm, 1, " cm") },
        { label: "Cintura", value: formatIndicator(assessment.girth_waist, 1, " cm") },
        { label: "Cadera", value: formatIndicator(assessment.girth_hip, 1, " cm") },
        { label: "Muslo", value: formatIndicator(assessment.girth_thigh, 1, " cm") },
        { label: "Pierna", value: formatIndicator(assessment.girth_calf, 1, " cm") },
        { label: "Húmero", value: formatIndicator(assessment.diameter_humerus, 1, " cm") },
        { label: "Biestiloideo", value: formatIndicator(assessment.diameter_bistyloid, 1, " cm") },
        { label: "Fémur", value: formatIndicator(assessment.diameter_femur, 1, " cm") },
      ],
    },
    {
      title: "Indicadores calculados",
      fields: [
        { label: "Suma 6 pliegues", value: formatIndicator(assessment.skinfold_sum_6, 1, " mm") },
        { label: "PR Brazo Corregido", value: formatIndicator(assessment.corrected_arm_girth, 2, " cm") },
        { label: "PR Muslo Corregido", value: formatIndicator(assessment.corrected_thigh_girth, 2, " cm") },
        { label: "PR Pierna Corregido", value: formatIndicator(assessment.corrected_calf_girth, 2, " cm") },
        { label: "Masa ósea", value: formatIndicator(assessment.bone_mass_kg, 2, " kg") },
        { label: "Masa muscular", value: formatIndicator(assessment.muscle_mass_kg, 2, " kg") },
        { label: "% Masa grasa", value: formatPercentage(assessment.fat_percentage) },
        { label: "Masa grasa", value: formatIndicator(assessment.fat_mass_kg, 2, " kg") },
        { label: "Masa libre de grasa", value: formatIndicator(assessment.fat_free_mass_kg, 2, " kg") },
        { label: "Masa adiposa", value: formatIndicator(assessment.adipose_mass_kg, 2, " kg") },
        { label: "Masa residual", value: formatIndicator(assessment.residual_mass_kg, 2, " kg") },
        { label: "% Masa muscular", value: formatPercentage(assessment.muscle_percentage) },
        { label: "% Masa ósea", value: formatPercentage(assessment.bone_percentage) },
        { label: "% Masa adiposa", value: formatPercentage(assessment.adipose_percentage) },
        { label: "% Masa residual", value: formatPercentage(assessment.residual_percentage) },
        { label: "IMC", value: formatIndicator(assessment.bmi, 2) },
        { label: "AKS", value: formatIndicator(assessment.aks_index, 2) },
      ],
    },
  ];
}
