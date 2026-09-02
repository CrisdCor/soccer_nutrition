import { notFound } from "next/navigation";
import { PlayerActionsMenu } from "@/components/jugadores/player-actions-menu";
import { PlayerAssessmentsTabs } from "@/components/jugadores/player-assessments-tabs";
import { PlayerPhotoUploader } from "@/components/jugadores/player-photo-uploader";
import { PlayerStatusSummary } from "@/components/jugadores/player-status-summary";
import { PlayerStatusToggle } from "@/components/jugadores/player-status-toggle";
import { computeDisplayAge } from "@/lib/calculations";
import { getCurrentThresholds, listDietTypes, listFoodGroups } from "@/lib/configuracion/queries";
import { getPlayerById, getPlayerPhotoUrl } from "@/lib/jugadores/queries";
import { getNutritionPlansByPlayer, listMealTypes } from "@/lib/nutricion/queries";
import { listWeighInsByPlayer } from "@/lib/pesajes/queries";
import { listAssessmentsByPlayer } from "@/lib/valoraciones/queries";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, assessments, thresholds, dietTypes, foodGroups, mealTypes, nutritionPlansByAssessment, weighIns] =
    await Promise.all([
      getPlayerById(id),
      listAssessmentsByPlayer(id),
      getCurrentThresholds(),
      listDietTypes({ activeOnly: true }),
      listFoodGroups({ activeOnly: true }),
      listMealTypes(),
      getNutritionPlansByPlayer(id),
      listWeighInsByPlayer(id),
    ]);

  if (!player) {
    notFound();
  }

  const photoUrl = await getPlayerPhotoUrl(player.photo_path);
  const age = computeDisplayAge(new Date(player.birth_date));
  const birthYear = new Date(player.birth_date).getFullYear();

  // Peso/Talla/IMC/%Grasa/IAKS son de la valoración más reciente, no del
  // jugador en sí -- si todavía no tiene ninguna, quedan vacíos (assessments
  // viene ascendente por fecha; la última es la más reciente).
  const latestAssessment = assessments.at(-1) ?? null;

  return (
    <div className="space-y-6">
      <PlayerStatusSummary
        player={player}
        age={age}
        latestAssessment={latestAssessment}
        fatPercentageThreshold={thresholds.fat_percentage}
        photoSlot={<PlayerPhotoUploader playerId={player.id} photoUrl={photoUrl} birthYear={birthYear} />}
        actionsSlot={
          <>
            <PlayerStatusToggle playerId={player.id} playerName={player.full_name} status={player.status} />
            <PlayerActionsMenu playerId={player.id} />
          </>
        }
      />

      <PlayerAssessmentsTabs
        playerId={player.id}
        playerSex={player.sex}
        playerBirthDate={player.birth_date}
        assessments={assessments}
        thresholds={thresholds}
        nutritionPlansByAssessment={nutritionPlansByAssessment}
        dietTypes={dietTypes}
        foodGroups={foodGroups}
        mealTypes={mealTypes}
        weighIns={weighIns}
        weighInThreshold={thresholds.weight_change_pct}
      />
    </div>
  );
}
