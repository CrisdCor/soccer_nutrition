import { InfoGroup, InfoItem } from "@/components/ui/info-grid";
import { formatIndicator, formatPercentage } from "@/lib/format";

export type AssessmentDetailFields = {
  weight_kg: number;
  height_cm: number;
  sitting_height_cm: number | null;
  wingspan_cm: number | null;
  skinfold_triceps: number | null;
  skinfold_subscapular: number | null;
  skinfold_biceps: number | null;
  skinfold_iliac_crest: number | null;
  skinfold_supraspinal: number | null;
  skinfold_abdominal: number | null;
  skinfold_thigh: number | null;
  skinfold_calf: number | null;
  girth_relaxed_arm: number | null;
  girth_flexed_arm: number | null;
  girth_waist: number | null;
  girth_hip: number | null;
  girth_thigh: number | null;
  girth_calf: number | null;
  diameter_humerus: number | null;
  diameter_bistyloid: number | null;
  diameter_femur: number | null;
  skinfold_sum_6: number | null;
  corrected_arm_girth: number | null;
  corrected_thigh_girth: number | null;
  corrected_calf_girth: number | null;
  bone_mass_kg: number | null;
  muscle_mass_kg: number | null;
  fat_percentage: number | null;
  fat_mass_kg: number | null;
  fat_free_mass_kg: number | null;
  adipose_mass_kg: number | null;
  residual_mass_kg: number | null;
  muscle_percentage: number | null;
  bone_percentage: number | null;
  adipose_percentage: number | null;
  residual_percentage: number | null;
  bmi: number | null;
  aks_index: number | null;
};

/**
 * Los 4 grupos de detalle de una valoración (medidas, pliegues, perímetros/
 * diámetros, indicadores calculados). Compartido entre /valoraciones/[id] y
 * el tab "Reporte" del perfil de jugador, para no duplicar el desglose.
 */
export function AssessmentDetailGroups({ assessment }: { assessment: AssessmentDetailFields }) {
  return (
    <div className="space-y-8">
      <InfoGroup title="Medidas capturadas">
        <InfoItem label="Peso" value={formatIndicator(assessment.weight_kg, 1, " kg")} />
        <InfoItem label="Talla" value={formatIndicator(assessment.height_cm, 1, " cm")} />
        <InfoItem label="Talla sentado" value={formatIndicator(assessment.sitting_height_cm, 1, " cm")} />
        <InfoItem label="Envergadura" value={formatIndicator(assessment.wingspan_cm, 1, " cm")} />
      </InfoGroup>

      <InfoGroup title="Pliegues cutáneos">
        <InfoItem label="Tríceps" value={formatIndicator(assessment.skinfold_triceps, 1, " mm")} />
        <InfoItem label="Subescapular" value={formatIndicator(assessment.skinfold_subscapular, 1, " mm")} />
        <InfoItem label="Bíceps" value={formatIndicator(assessment.skinfold_biceps, 1, " mm")} />
        <InfoItem label="Cresta ilíaca" value={formatIndicator(assessment.skinfold_iliac_crest, 1, " mm")} />
        <InfoItem label="Supraespinal" value={formatIndicator(assessment.skinfold_supraspinal, 1, " mm")} />
        <InfoItem label="Abdominal" value={formatIndicator(assessment.skinfold_abdominal, 1, " mm")} />
        <InfoItem label="Muslo" value={formatIndicator(assessment.skinfold_thigh, 1, " mm")} />
        <InfoItem label="Pierna" value={formatIndicator(assessment.skinfold_calf, 1, " mm")} />
      </InfoGroup>

      <InfoGroup title="Perímetros y diámetros">
        <InfoItem label="Brazo relajado" value={formatIndicator(assessment.girth_relaxed_arm, 1, " cm")} />
        <InfoItem label="Brazo flexionado" value={formatIndicator(assessment.girth_flexed_arm, 1, " cm")} />
        <InfoItem label="Cintura" value={formatIndicator(assessment.girth_waist, 1, " cm")} />
        <InfoItem label="Cadera" value={formatIndicator(assessment.girth_hip, 1, " cm")} />
        <InfoItem label="Muslo" value={formatIndicator(assessment.girth_thigh, 1, " cm")} />
        <InfoItem label="Pierna" value={formatIndicator(assessment.girth_calf, 1, " cm")} />
        <InfoItem label="Húmero" value={formatIndicator(assessment.diameter_humerus, 1, " cm")} />
        <InfoItem label="Biestiloideo" value={formatIndicator(assessment.diameter_bistyloid, 1, " cm")} />
        <InfoItem label="Fémur" value={formatIndicator(assessment.diameter_femur, 1, " cm")} />
      </InfoGroup>

      <InfoGroup title="Indicadores calculados">
        <InfoItem label="Suma 6 pliegues" value={formatIndicator(assessment.skinfold_sum_6, 1, " mm")} />
        <InfoItem label="PR Brazo Corregido" value={formatIndicator(assessment.corrected_arm_girth, 2, " cm")} />
        <InfoItem label="PR Muslo Corregido" value={formatIndicator(assessment.corrected_thigh_girth, 2, " cm")} />
        <InfoItem label="PR Pierna Corregido" value={formatIndicator(assessment.corrected_calf_girth, 2, " cm")} />
        <InfoItem label="Masa ósea" value={formatIndicator(assessment.bone_mass_kg, 2, " kg")} />
        <InfoItem label="Masa muscular" value={formatIndicator(assessment.muscle_mass_kg, 2, " kg")} />
        <InfoItem label="% Masa grasa" value={formatPercentage(assessment.fat_percentage)} />
        <InfoItem label="Masa grasa" value={formatIndicator(assessment.fat_mass_kg, 2, " kg")} />
        <InfoItem label="Masa libre de grasa" value={formatIndicator(assessment.fat_free_mass_kg, 2, " kg")} />
        <InfoItem label="Masa adiposa" value={formatIndicator(assessment.adipose_mass_kg, 2, " kg")} />
        <InfoItem label="Masa residual" value={formatIndicator(assessment.residual_mass_kg, 2, " kg")} />
        <InfoItem label="% Masa muscular" value={formatPercentage(assessment.muscle_percentage)} />
        <InfoItem label="% Masa ósea" value={formatPercentage(assessment.bone_percentage)} />
        <InfoItem label="% Masa adiposa" value={formatPercentage(assessment.adipose_percentage)} />
        <InfoItem label="% Masa residual" value={formatPercentage(assessment.residual_percentage)} />
        <InfoItem label="IMC" value={formatIndicator(assessment.bmi, 2)} />
        <InfoItem label="AKS" value={formatIndicator(assessment.aks_index, 2)} />
      </InfoGroup>
    </div>
  );
}
