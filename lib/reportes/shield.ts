import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Escudo del equipo (public/logo.webp) normalizado a PNG y embebido como
 * data URI -- compartido por los dos renderers de reporte (PDF y Word):
 * ninguno de los dos decodifica WEBP directamente (ver getPlayerPhotoDataUri
 * en lib/reportes/queries.ts, mismo criterio). Se lee/convierte una sola vez
 * por instancia de la función serverless (no cambia entre requests).
 */
let shieldDataUriCache: Promise<string | null> | undefined;

export function getShieldDataUri(): Promise<string | null> {
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
