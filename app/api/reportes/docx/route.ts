import { Packer } from "docx";
import type { NextRequest } from "next/server";
import { requireProfile } from "@/lib/auth/session";
import { listCategories } from "@/lib/catalogos/queries";
import { getCurrentThresholds, listDietTypes, listFoodGroups } from "@/lib/configuracion/queries";
import { getNutritionPlansByAssessmentIds, listMealTypes } from "@/lib/nutricion/queries";
import { buildReportDocument } from "@/lib/docx/report-document";
import type { ReportDocumentData, ReportPlayerData } from "@/lib/pdf/types";
import {
  getCategoryReportPlayers,
  getPlayerPhotoDataUri,
  getPlayerReportAssessment,
} from "@/lib/reportes/queries";
import { ROLE_TITLES, slugify } from "@/lib/reportes/route-shared";
import { getShieldDataUri } from "@/lib/reportes/shield";

// docx usa APIs de Node -- no corre en el Edge Runtime, igual que el PDF
// (ver app/api/reportes/pdf/route.tsx).
export const runtime = "nodejs";

/**
 * GET /api/reportes/docx?mode=grupal&category=<id>&valoracion=<label>
 * GET /api/reportes/docx?mode=individual&player=<id>&valoracion=<label>
 *
 * Misma consulta/armado de datos que /api/reportes/pdf (ver ese archivo):
 * este handler solo cambia el renderer de salida (Document/Packer de
 * `docx` en vez de renderToBuffer de @react-pdf/renderer). No se duplica
 * ninguna lógica de obtención de datos.
 */
export async function GET(request: NextRequest) {
  const { profile } = await requireProfile();

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "individual" ? "individual" : "grupal";
  const valoracionLabel = searchParams.get("valoracion");

  if (!valoracionLabel) {
    return new Response("Falta el parámetro valoracion.", { status: 400 });
  }

  const [thresholds, dietTypes, foodGroups, mealTypes, shieldDataUri] = await Promise.all([
    getCurrentThresholds(),
    listDietTypes({ activeOnly: true }),
    listFoodGroups({ activeOnly: true }),
    listMealTypes(),
    getShieldDataUri(),
  ]);

  const sharedData = {
    valoracionLabel,
    generatedAtLabel: new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    generatedByName: profile.full_name,
    generatedByRoleTitle: ROLE_TITLES[profile.role] ?? "",
    shieldDataUri,
    thresholds,
    catalogs: { dietTypes, foodGroups, mealTypes },
  };

  if (mode === "individual") {
    const playerId = searchParams.get("player");
    if (!playerId) {
      return new Response("Falta el parámetro player.", { status: 400 });
    }

    const pair = await getPlayerReportAssessment(playerId, valoracionLabel);
    if (!pair) {
      return new Response("No se encontró una valoración con esa etiqueta para ese jugador.", { status: 404 });
    }

    const plansByAssessment = await getNutritionPlansByAssessmentIds([pair.assessment.id]);
    const player: ReportPlayerData = {
      player: pair.player,
      assessment: pair.assessment,
      plan: plansByAssessment[pair.assessment.id] ?? null,
      photoDataUri: await getPlayerPhotoDataUri(pair.player.photo_path),
    };

    const data: ReportDocumentData = {
      ...sharedData,
      mode: "individual",
      categoryName: pair.player.full_name,
      players: [player],
    };

    return renderDocxResponse(data, `informe-${slugify(pair.player.full_name)}-${slugify(valoracionLabel)}.docx`);
  }

  const categoryId = searchParams.get("category");
  if (!categoryId) {
    return new Response("Falta el parámetro category.", { status: 400 });
  }

  const categories = await listCategories({ activeOnly: true });
  const category = categories.find((c) => c.id === categoryId);
  if (!category) {
    return new Response("Categoría no encontrada.", { status: 404 });
  }

  const pairs = await getCategoryReportPlayers(categoryId, valoracionLabel);
  if (pairs.length === 0) {
    return new Response(
      "No hay jugadores activos de esta categoría con una valoración registrada para esa etiqueta.",
      { status: 404 }
    );
  }

  const assessmentIds = pairs.map((pair) => pair.assessment.id);
  const plansByAssessment = await getNutritionPlansByAssessmentIds(assessmentIds);

  const players: ReportPlayerData[] = await Promise.all(
    pairs.map(async (pair) => ({
      player: pair.player,
      assessment: pair.assessment,
      plan: plansByAssessment[pair.assessment.id] ?? null,
      photoDataUri: await getPlayerPhotoDataUri(pair.player.photo_path),
    }))
  );

  const data: ReportDocumentData = {
    ...sharedData,
    mode: "grupal",
    categoryName: category.name,
    players,
  };

  return renderDocxResponse(data, `informe-${slugify(category.name)}-${slugify(valoracionLabel)}.docx`);
}

async function renderDocxResponse(data: ReportDocumentData, fileName: string): Promise<Response> {
  const buffer = await Packer.toBuffer(buildReportDocument(data));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
