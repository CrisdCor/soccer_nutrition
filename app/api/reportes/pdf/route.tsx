import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import { requireProfile } from "@/lib/auth/session";
import { listCategories } from "@/lib/catalogos/queries";
import { getCurrentThresholds, listDietTypes, listFoodGroups } from "@/lib/configuracion/queries";
import { getNutritionPlansByAssessmentIds, listMealTypes } from "@/lib/nutricion/queries";
import { ReportDocument } from "@/lib/pdf/report-document";
import type { ReportDocumentData, ReportPlayerData } from "@/lib/pdf/types";
import {
  getCategoryReportPlayers,
  getPlayerAksHistory,
  getPlayerPhotoDataUri,
  getPlayerReportAssessment,
} from "@/lib/reportes/queries";
import { ROLE_TITLES, slugify } from "@/lib/reportes/route-shared";
import { getShieldDataUri } from "@/lib/reportes/shield";

// @react-pdf/renderer usa APIs de Node (fs, streams) -- no corre en el
// Edge Runtime. Route Handlers son Node por defecto, esto lo deja explícito.
export const runtime = "nodejs";

/**
 * GET /api/reportes/pdf?mode=grupal&category=<id>&valoracion=<label>
 * GET /api/reportes/pdf?mode=individual&player=<id>&valoracion=<label>
 *
 * Genera y descarga el Informe General en PDF:
 * - "grupal" (default si `mode` falta, para no romper links viejos):
 *   portada + tabla grupal + una página por jugador activo de la
 *   categoría con esa valoración.
 * - "individual": portada + una sola página, reutilizando el mismo
 *   PlayerPage del modo grupal (ver lib/pdf/report-document.tsx) -- no
 *   hay tabla grupal, no aplica con un solo jugador.
 *
 * Requiere sesión (proxy.ts ya protege /api/* igual que el resto de la
 * app); no hay restricción de rol adicional -- generar/leer el reporte no
 * es una operación de escritura, así que role = 'lider' también puede
 * usarlo.
 */
export async function GET(request: NextRequest) {
  const { profile } = await requireProfile();

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "individual" ? "individual" : "grupal";
  const valoracionLabel = searchParams.get("valoracion");
  // Checkbox "Incluir plan de alimentación" de /reportes -- marcado por
  // defecto (también para no romper links viejos sin este parámetro).
  const includePlan = searchParams.get("includePlan") !== "false";

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
    includePlan,
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

    const [plansByAssessment, photoDataUri, aksHistory] = await Promise.all([
      getNutritionPlansByAssessmentIds([pair.assessment.id]),
      getPlayerPhotoDataUri(pair.player.photo_path),
      getPlayerAksHistory(playerId),
    ]);
    const player: ReportPlayerData = {
      player: pair.player,
      assessment: pair.assessment,
      plan: plansByAssessment[pair.assessment.id] ?? null,
      photoDataUri,
    };

    const data: ReportDocumentData = {
      ...sharedData,
      mode: "individual",
      categoryName: pair.player.full_name,
      players: [player],
      // Gráfico de evolución de AKS (ver lib/pdf/aks-evolution-chart.tsx):
      // el propio PlayerPage lo omite si el jugador tiene una sola
      // valoración, acá no hace falta duplicar esa condición.
      aksHistory,
    };

    return renderPdfResponse(data, `informe-${slugify(pair.player.full_name)}-${slugify(valoracionLabel)}.pdf`);
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
    // El gráfico de evolución de AKS es solo del reporte individual (ver
    // lib/pdf/aks-evolution-chart.tsx) -- no aplica por jugador dentro de
    // una tabla comparativa de toda la categoría.
    aksHistory: null,
  };

  return renderPdfResponse(data, `informe-${slugify(category.name)}-${slugify(valoracionLabel)}.pdf`);
}

async function renderPdfResponse(data: ReportDocumentData, fileName: string): Promise<Response> {
  const buffer = await renderToBuffer(<ReportDocument data={data} />);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
