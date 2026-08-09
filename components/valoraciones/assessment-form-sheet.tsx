"use client";

import { useRouter } from "next/navigation";
import * as Sheet from "@/components/ui/sheet";
import { AssessmentForm } from "@/components/valoraciones/assessment-form";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import { createAssessment, updateAssessment } from "@/lib/valoraciones/actions";
import type { AssessmentFormValues } from "@/lib/validation/assessment";

type ExistingAssessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };

type AssessmentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & ({ mode: "create"; playerId: string } | { mode: "edit"; assessment: ExistingAssessment });

function numToStr(value: number | null): string {
  return value != null ? String(value) : "";
}

/**
 * Crear/editar valoración en un panel lateral -- reemplaza las antiguas
 * pantallas standalone (/jugadores/[id]/valoraciones/nueva y
 * /valoraciones/[id]/editar). "Editar" sigue siendo admin-only: quien
 * dispara este panel en modo "edit" lo gatea (ver AssessmentRowActions), la
 * action en sí también lo exige server-side. Completamente controlado
 * (open/onOpenChange), sin trigger propio -- se usa tanto desde el botón
 * "Nueva valoración" del encabezado como desde el ítem "Editar valoración"
 * del menú "•••" de cada fila.
 */
export function AssessmentFormSheet(props: AssessmentFormSheetProps) {
  const router = useRouter();

  function handleSuccess() {
    props.onOpenChange(false);
    router.refresh();
  }

  const isEdit = props.mode === "edit";
  const action = isEdit
    ? (values: AssessmentFormValues) => updateAssessment(props.assessment.id, values)
    : (values: AssessmentFormValues) => createAssessment(props.playerId, values);

  const defaultValues: Partial<AssessmentFormValues> | undefined = isEdit
    ? {
        assessment_date: props.assessment.assessment_date,
        label: props.assessment.label,
        weight_kg: numToStr(props.assessment.weight_kg),
        height_cm: numToStr(props.assessment.height_cm),
        sitting_height_cm: numToStr(props.assessment.sitting_height_cm),
        wingspan_cm: numToStr(props.assessment.wingspan_cm),
        skinfold_triceps: numToStr(props.assessment.skinfold_triceps),
        skinfold_subscapular: numToStr(props.assessment.skinfold_subscapular),
        skinfold_biceps: numToStr(props.assessment.skinfold_biceps),
        skinfold_iliac_crest: numToStr(props.assessment.skinfold_iliac_crest),
        skinfold_supraspinal: numToStr(props.assessment.skinfold_supraspinal),
        skinfold_abdominal: numToStr(props.assessment.skinfold_abdominal),
        skinfold_thigh: numToStr(props.assessment.skinfold_thigh),
        skinfold_calf: numToStr(props.assessment.skinfold_calf),
        girth_relaxed_arm: numToStr(props.assessment.girth_relaxed_arm),
        girth_flexed_arm: numToStr(props.assessment.girth_flexed_arm),
        girth_waist: numToStr(props.assessment.girth_waist),
        girth_hip: numToStr(props.assessment.girth_hip),
        girth_thigh: numToStr(props.assessment.girth_thigh),
        girth_calf: numToStr(props.assessment.girth_calf),
        diameter_humerus: numToStr(props.assessment.diameter_humerus),
        diameter_bistyloid: numToStr(props.assessment.diameter_bistyloid),
        diameter_femur: numToStr(props.assessment.diameter_femur),
      }
    : undefined;

  return (
    <Sheet.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>{isEdit ? "Editar valoración" : "Nueva valoración"}</Sheet.Title>
          <Sheet.Description>
            {isEdit ? `${props.assessment.label} · ${props.assessment.assessment_date}` : "20 campos de medición"}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body>
          <AssessmentForm
            defaultValues={defaultValues}
            action={action}
            submitLabel={isEdit ? "Guardar cambios" : "Guardar valoración"}
            onSuccess={handleSuccess}
            onCancel={() => props.onOpenChange(false)}
          />
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  );
}
