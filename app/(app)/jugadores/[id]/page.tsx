import { notFound } from "next/navigation";
import { PlayerActionsMenu } from "@/components/jugadores/player-actions-menu";
import { PlayerAssessmentsTabs } from "@/components/jugadores/player-assessments-tabs";
import { PlayerPhotoUploader } from "@/components/jugadores/player-photo-uploader";
import { computeDisplayAge } from "@/lib/calculations";
import { getCurrentThresholds, listDietTypes, listFoodGroups } from "@/lib/configuracion/queries";
import { formatIndicator, formatPercentage } from "@/lib/format";
import { getPlayerById, getPlayerPhotoUrl } from "@/lib/jugadores/queries";
import { getNutritionPlansByPlayer, listMealTypes } from "@/lib/nutricion/queries";
import { listAssessmentsByPlayer } from "@/lib/valoraciones/queries";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [player, assessments, thresholds, dietTypes, foodGroups, mealTypes, nutritionPlansByAssessment] =
    await Promise.all([
      getPlayerById(id),
      listAssessmentsByPlayer(id),
      getCurrentThresholds(),
      listDietTypes({ activeOnly: true }),
      listFoodGroups({ activeOnly: true }),
      listMealTypes(),
      getNutritionPlansByPlayer(id),
    ]);

  if (!player) {
    notFound();
  }

  const photoUrl = await getPlayerPhotoUrl(player.photo_path);
  const age = computeDisplayAge(new Date(player.birth_date));
  const birthYear = new Date(player.birth_date).getFullYear();

  // Peso/Talla/IMC/%Grasa/IAKS son de la valoración más reciente, no del
  // jugador en sí -- si todavía no tiene ninguna, quedan en "Dato insuficiente"
  // (assessments viene ascendente por fecha; la última es la más reciente).
  const latestAssessment = assessments.at(-1) ?? null;

  const subtitleParts = [player.category?.name, player.home_club ? "Cantera" : null].filter(
    (part): part is string => Boolean(part)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start gap-6">
          <PlayerPhotoUploader playerId={player.id} photoUrl={photoUrl} birthYear={birthYear} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{player.full_name}</h2>
                  {player.status === "inactive" && (
                    <span className="rounded border border-border-strong px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      Inactivo
                    </span>
                  )}
                </div>
                {subtitleParts.length > 0 && (
                  <p className="text-sm text-muted">{subtitleParts.join(" · ")}</p>
                )}
              </div>

              <PlayerActionsMenu playerId={player.id} playerName={player.full_name} status={player.status} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              <HeaderStat label="Posición" value={player.position?.name ?? "—"} />
              <HeaderStat label="Edad" value={String(age)} />
              <HeaderStat label="Peso" value={formatIndicator(latestAssessment?.weight_kg ?? null, 1, " kg")} />
              <HeaderStat label="Talla" value={formatIndicator(latestAssessment?.height_cm ?? null, 1, " cm")} />
            </div>

            <div className="mt-4 grid max-w-xs grid-cols-3 gap-x-8 border-t border-border pt-4">
              <HeaderStat label="IMC" value={formatIndicator(latestAssessment?.bmi ?? null, 2)} />
              <HeaderStat label="% Grasa" value={formatPercentage(latestAssessment?.fat_percentage ?? null)} />
              <HeaderStat label="IAKS" value={formatIndicator(latestAssessment?.aks_index ?? null, 2)} />
            </div>
          </div>
        </div>
      </div>

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
      />
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="data mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
