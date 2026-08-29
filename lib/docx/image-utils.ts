/**
 * Los data URI ya vienen resueltos por lib/reportes/shield.ts y
 * lib/reportes/queries.ts (getPlayerPhotoDataUri) -- pensados originalmente
 * para @react-pdf/renderer, que los consume tal cual. docx.js necesita los
 * bytes crudos (ImageRun no acepta un data URI), así que esto solo decodifica
 * el base64 ya descargado/convertido; no vuelve a pedir el archivo.
 */
export function dataUriToBuffer(dataUri: string | null): Buffer | null {
  if (!dataUri) return null;
  const commaIndex = dataUri.indexOf(",");
  if (commaIndex === -1) return null;
  return Buffer.from(dataUri.slice(commaIndex + 1), "base64");
}
