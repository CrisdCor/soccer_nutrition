"use client";

import { useState } from "react";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { AssessmentDetailSheet } from "@/components/valoraciones/assessment-detail-sheet";
import { AssessmentFormSheet } from "@/components/valoraciones/assessment-form-sheet";
import { NutritionPlanSheet } from "@/components/nutricion/nutrition-plan-sheet";
import type { AssessmentDetailFields } from "@/components/valoraciones/assessment-detail-groups";
import { useUserProfile } from "@/lib/auth/user-profile-context";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";
import type { ThresholdRange } from "@/lib/format";

type CatalogOption = { id: string; name: string };
type MealType = { id: number; name: string; sort_order: number };
type Assessment = AssessmentDetailFields & { id: string; assessment_date: string; label: string };

/**
 * Menú "•••" por fila de la tabla de valoraciones. Tres ítems:
 *  - "Ver detalle": panel de solo lectura (reemplaza el antiguo link a
 *    /valoraciones/[id]).
 *  - "Ver/crear plan nutricional": el mismo panel de formulario de plan que
 *    dispara el botón del encabezado, pero fijado a la valoración de ESTA
 *    fila -- no necesariamente la más reciente.
 *  - "Editar valoración" (solo admin): decisión propia no pedida
 *    explícitamente en el encabargo -- se mantiene porque assessments es
 *    insert-only para nutricionista y update es admin-only a nivel de RLS;
 *    quitar la edición hubiera sido perder una regla de negocio existente.
 *    Gateado en el cliente vía useUserProfile() y reforzado server-side en
 *    updateAssessment().
 *
 * Cada ítem controla el open/onOpenChange de su propio panel -- un
 * DropdownMenu.Item no puede anidar su propio trigger con estado local.
 */
export function AssessmentRowActions({
  assessment,
  playerId,
  playerSex,
  playerBirthDate,
  existingPlan,
  thresholds,
  dietTypes,
  foodGroups,
  mealTypes,
}: {
  assessment: Assessment;
  playerId: string;
  playerSex: "Hombre" | "Mujer";
  playerBirthDate: string;
  existingPlan: NutritionPlanFull | null;
  thresholds: { skinfold_sum: ThresholdRange | null; aks_index: ThresholdRange | null };
  dietTypes: CatalogOption[];
  foodGroups: CatalogOption[];
  mealTypes: MealType[];
}) {
  const { role } = useUserProfile();
  const [detailOpen, setDetailOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className="btn-secondary" aria-label="Más acciones">
            •••
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => setDetailOpen(true)}>Ver detalle</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => setPlanOpen(true)}>Ver/crear plan nutricional</DropdownMenu.Item>
          {role === "admin" && (
            <DropdownMenu.Item onSelect={() => setEditOpen(true)}>Editar valoración</DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <AssessmentDetailSheet assessment={assessment} open={detailOpen} onOpenChange={setDetailOpen} />

      <NutritionPlanSheet
        playerId={playerId}
        playerSex={playerSex}
        playerBirthDate={playerBirthDate}
        assessment={assessment}
        existingPlan={existingPlan}
        thresholds={thresholds}
        dietTypes={dietTypes}
        foodGroups={foodGroups}
        mealTypes={mealTypes}
        open={planOpen}
        onOpenChange={setPlanOpen}
      />

      {role === "admin" && (
        <AssessmentFormSheet mode="edit" assessment={assessment} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </>
  );
}
