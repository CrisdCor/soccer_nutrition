import fs from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import type { NextRequest } from "next/server";
import sharp from "sharp";
import { requireProfile } from "@/lib/auth/session";
import { listCategories } from "@/lib/catalogos/queries";
import { getCurrentThresholds, listDietTypes, listFoodGroups } from "@/lib/configuracion/queries";
import { getNutritionPlansByAssessmentIds, listMealTypes } from "@/lib/nutricion/queries";
import { ReportDocument } from "@/lib/pdf/report-document";
import type { ReportDocumentData, ReportPlayerData } from "@/lib/pdf/types";
import { getCategoryReportPlayers, getPlayerPhotoDataUri } from "@/lib/reportes/queries";

// @react-pdf/renderer usa APIs de Node (fs, streams) -- no corre en el
// Edge Runtime. Route Handlers son Node por defecto, esto lo deja explícito.
export const runtime = "nodejs";

// new RegExp(...) en vez de un literal /[̀-ͯ]/ -- el literal se
// guarda con el caracter combinante real embebido en el archivo fuente en
// este entorno de edición, ilegible en un diff; construirlo desde el
// escape \u evita eso.
const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

const ROLE_TITLES: Record<string, string> = {
  nutricionista: "Nutricionista Deportiva",
  admin: "Administrador",
  lider: "Líder de Proceso",
};

/**
 * Se lee/convierte una sola vez por instancia de la función (no cambia
 * entre requests): evita releer y reconvertir el archivo en cada descarga.
 * @react-pdf/renderer no decodifica WEBP (ver getPlayerPhotoDataUri en
 * lib/reportes/queries.ts) -- el escudo vive en public/logo.webp, así que
 * se normaliza a PNG con sharp igual que las fotos de jugador.
 */
let shieldDataUriCache: Promise<string | null> | undefined;

function getShieldDataUri(): Promise<string | null> {
  if (!shieldDataUriCache) {
    shieldDataUriCache = (async () => {
      try {
        const filePath = path.join(process.cwd(), "public", "logo.webp");
        const buffer = fs.readFileSync(filePath);
        const pngBuffer = await sharp(buffer).png().toBuffer();
        return `data:image/png;base64,${pngBuffer.toString("base64")}`;
      } catch {
        return null;
      }
    })();
  }
  return shieldDataUriCache;
}

/**
 * GET /api/reportes/pdf?category=<id>&valoracion=<label>
 * Genera y descarga el Informe General (portada + tabla grupal + una
 * página por jugador) de una categoría en una valoración puntual. Requiere
 * sesión (proxy.ts ya protege /api/* igual que el resto de la app); no hay
 * restricción de rol adicional -- generar/leer el reporte no es una
 * operación de escritura, así que role = 'lider' también puede usarlo.
 */
export async function GET(request: NextRequest) {
  const { profile } = await requireProfile();

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("category");
  const valoracionLabel = searchParams.get("valoracion");

  if (!categoryId || !valoracionLabel) {
    return new Response("Faltan los parámetros category y valoracion.", { status: 400 });
  }

  const categories = await listCategories({ activeOnly: true });
  const category = categories.find((c) => c.id === categoryId);
  if (!category) {
    return new Response("Categoría no encontrada.", { status: 404 });
  }

  const [pairs, thresholds, dietTypes, foodGroups, mealTypes, shieldDataUri] = await Promise.all([
    getCategoryReportPlayers(categoryId, valoracionLabel),
    getCurrentThresholds(),
    listDietTypes({ activeOnly: true }),
    listFoodGroups({ activeOnly: true }),
    listMealTypes(),
    getShieldDataUri(),
  ]);

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
    categoryName: category.name,
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
    players,
    catalogs: { dietTypes, foodGroups, mealTypes },
  };

  const buffer = await renderToBuffer(<ReportDocument data={data} />);
  const fileName = `informe-${slugify(category.name)}-${slugify(valoracionLabel)}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
