import { notFound } from "next/navigation";
import { PlayerPhotoUploader } from "@/components/jugadores/player-photo-uploader";
import { PlayerStatusSummary } from "@/components/jugadores/player-status-summary";
import { NutritionPlanReport } from "@/components/nutricion/nutrition-plan-report";
import * as Tabs from "@/components/ui/tabs";
import { computeDisplayAge } from "@/lib/calculations";
import { getCurrentThresholds, listDietTypes, listFoodGroups } from "@/lib/configuracion/queries";
import { getPlayerById, getPlayerPhotoUrl } from "@/lib/jugadores/queries";
import { getNutritionPlansByPlayer, listMealTypes } from "@/lib/nutricion/queries";
import { requirePlayerProfile } from "@/lib/portal/session";
import { listAssessmentsByPlayer } from "@/lib/valoraciones/queries";

/**
 * "Mi estado" / "Mi plan", ambas en modo lectura -- ver spec del handoff.
 * Reutiliza exactamente los mismos componentes/queries que ya usa el
 * perfil de jugador de staff (PlayerStatusSummary, NutritionPlanReport):
 * no se duplica ni el cálculo ni el layout, solo se cablea con los datos
 * del jugador vinculado a esta cuenta en vez de un :id de la URL.
 */
export default async function PortalPage() {
  const { playerId } = await requirePlayerProfile();

  // requirePlayerProfile() ya redirige si no hay sesión o el rol no es
  // 'jugador'; playerId null (cuenta sin vincular) lo maneja el layout
  // (app/portal/layout.tsx) mostrando su propio estado, así que si
  // llegamos hasta acá siempre viene con valor.
  if (!playerId) {
    notFound();
  }

  const [player, assessments, thresholds, dietTypes, foodGroups, mealTypes, nutritionPlansByAssessment] =
    await Promise.all([
      getPlayerById(playerId),
      listAssessmentsByPlayer(playerId),
      getCurrentThresholds(),
      listDietTypes({ activeOnly: true }),
      listFoodGroups({ activeOnly: true }),
      listMealTypes(),
      getNutritionPlansByPlayer(playerId),
    ]);

  if (!player) {
    notFound();
  }

  const photoUrl = await getPlayerPhotoUrl(player.photo_path);
  const age = computeDisplayAge(new Date(player.birth_date));
  const birthYear = new Date(player.birth_date).getFullYear();
  const latestAssessment = assessments.at(-1) ?? null;

  // "el plan de su valoración más reciente que tenga plan" -- no
  // necesariamente la última valoración en sí (spec del handoff): se
  // busca desde la más reciente hacia atrás la primera que tenga plan.
  const latestAssessmentWithPlan = [...assessments].reverse().find((a) => nutritionPlansByAssessment[a.id]);
  const activePlan = latestAssessmentWithPlan ? nutritionPlansByAssessment[latestAssessmentWithPlan.id] : null;

  return (
    <Tabs.Root defaultValue="estado">
      <Tabs.List>
        <Tabs.Trigger value="estado">Mi estado</Tabs.Trigger>
        <Tabs.Trigger value="plan">Mi plan</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="estado" className="pt-4">
        <PlayerStatusSummary
          player={player}
          age={age}
          latestAssessment={latestAssessment}
          fatPercentageThreshold={thresholds.fat_percentage}
          photoSlot={<PlayerPhotoUploader playerId={player.id} photoUrl={photoUrl} birthYear={birthYear} />}
        />
      </Tabs.Content>

      <Tabs.Content value="plan" className="pt-4">
        {activePlan ? (
          <NutritionPlanReport plan={activePlan} dietTypes={dietTypes} foodGroups={foodGroups} mealTypes={mealTypes} />
        ) : (
          <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-muted">
            Tu nutricionista aún no ha registrado tu plan.
          </div>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}
