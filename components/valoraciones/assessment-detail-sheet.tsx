"use client";

import * as Sheet from "@/components/ui/sheet";
import { AssessmentDetailGroups, type AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import type { ThresholdRange } from "@/lib/format";

type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };

/**
 * Solo lectura -- reemplaza la antigua pantalla standalone /valoraciones/[id].
 * Completamente controlado (open/onOpenChange), sin trigger propio: quien
 * lo usa decide cómo se dispara (botón suelto, ítem de un DropdownMenu, etc).
 */
export function AssessmentDetailSheet({
  assessment,
  fatPercentageThreshold,
  open,
  onOpenChange,
}: {
  assessment: Assessment;
  fatPercentageThreshold: ThresholdRange | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>{assessment.label}</Sheet.Title>
          <Sheet.Description>{assessment.assessment_date}</Sheet.Description>
        </Sheet.Header>
        <Sheet.Body>
          <AssessmentDetailGroups assessment={assessment} fatPercentageThreshold={fatPercentageThreshold} />
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  );
}
