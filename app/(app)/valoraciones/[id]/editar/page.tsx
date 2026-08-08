import { notFound, redirect } from "next/navigation";
import { AssessmentForm } from "@/components/valoraciones/assessment-form";
import { requireProfile } from "@/lib/auth/session";
import { updateAssessment } from "@/lib/valoraciones/actions";
import { getAssessmentById } from "@/lib/valoraciones/queries";

function numToStr(value: number | null): string {
  return value != null ? String(value) : "";
}

export default async function EditarValoracionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireProfile();

  // Solo admin puede editar (política RLS de UPDATE en assessments).
  if (profile.role !== "admin") {
    redirect(`/valoraciones/${id}`);
  }

  const assessment = await getAssessmentById(id);
  if (!assessment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Editar valoración</h2>
        <p className="text-sm text-muted">
          {assessment.player?.full_name} · {assessment.label}
        </p>
      </div>

      <AssessmentForm
        defaultValues={{
          assessment_date: assessment.assessment_date,
          label: assessment.label,
          weight_kg: numToStr(assessment.weight_kg),
          height_cm: numToStr(assessment.height_cm),
          sitting_height_cm: numToStr(assessment.sitting_height_cm),
          wingspan_cm: numToStr(assessment.wingspan_cm),
          skinfold_triceps: numToStr(assessment.skinfold_triceps),
          skinfold_subscapular: numToStr(assessment.skinfold_subscapular),
          skinfold_biceps: numToStr(assessment.skinfold_biceps),
          skinfold_iliac_crest: numToStr(assessment.skinfold_iliac_crest),
          skinfold_supraspinal: numToStr(assessment.skinfold_supraspinal),
          skinfold_abdominal: numToStr(assessment.skinfold_abdominal),
          skinfold_thigh: numToStr(assessment.skinfold_thigh),
          skinfold_calf: numToStr(assessment.skinfold_calf),
          girth_relaxed_arm: numToStr(assessment.girth_relaxed_arm),
          girth_flexed_arm: numToStr(assessment.girth_flexed_arm),
          girth_waist: numToStr(assessment.girth_waist),
          girth_hip: numToStr(assessment.girth_hip),
          girth_thigh: numToStr(assessment.girth_thigh),
          girth_calf: numToStr(assessment.girth_calf),
          diameter_humerus: numToStr(assessment.diameter_humerus),
          diameter_bistyloid: numToStr(assessment.diameter_bistyloid),
          diameter_femur: numToStr(assessment.diameter_femur),
        }}
        action={updateAssessment.bind(null, assessment.id)}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
