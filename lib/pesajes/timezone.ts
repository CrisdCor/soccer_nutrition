// Bogotá (UTC-5, sin horario de verano) es la única zona horaria de la
// organización por ahora -- mismo criterio que "por ahora, la única
// organización" en otros comentarios del proyecto (ver
// lib/jugadores/actions.ts). Todo el manejo de fechas de Pesajes pasa por
// acá para no repetir esta cuenta en cada archivo.
export const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

const DATE_STRING_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string | undefined | null): value is string {
  return !!value && DATE_STRING_PATTERN.test(value);
}

function parseDateString(dateStr: string): [number, number, number] {
  const match = DATE_STRING_PATTERN.exec(dateStr);
  if (!match) throw new Error(`Fecha inválida: ${dateStr}`);
  const [, y, m, d] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)!;
  return [Number(y), Number(m), Number(d)];
}

/** "YYYY-MM-DD" del día calendario en Bogotá al que corresponde un instante. */
export function toBogotaDateString(isoOrMs: string | number): string {
  const instantMs = typeof isoOrMs === "string" ? new Date(isoOrMs).getTime() : isoOrMs;
  const bogota = new Date(instantMs - BOGOTA_OFFSET_MS);
  const y = bogota.getUTCFullYear();
  const m = String(bogota.getUTCMonth() + 1).padStart(2, "0");
  const d = String(bogota.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" de hoy, en Bogotá -- default del selector de fecha. */
export function getTodayDateStringBogota(): string {
  return toBogotaDateString(Date.now());
}

/**
 * `dateStr` menos `days` días de calendario -- aritmética pura sobre
 * Y-M-D (no sobre el instante real), para no arrastrar el offset de
 * Bogotá acá: da igual en qué huso corra esto, "N días de calendario
 * antes" es lo mismo en cualquiera.
 */
export function subtractDaysFromDateString(dateStr: string, days: number): string {
  const [y, m, d] = parseDateString(dateStr);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

/** Ventana [inicio, fin) en UTC de un día calendario en Bogotá. */
export function getDateRangeBogota(dateStr: string): { startIso: string; endIso: string } {
  const [y, m, d] = parseDateString(dateStr);
  const startUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0) + BOGOTA_OFFSET_MS;
  const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000;
  return { startIso: new Date(startUtcMs).toISOString(), endIso: new Date(endUtcMs).toISOString() };
}

/**
 * `recorded_at` para un registro nuevo en una fecha puntual: la hora
 * actual de verdad (en Bogotá), combinada con la fecha elegida en el
 * selector -- ni medianoche ni "ahora mismo" a ciegas si se está cargando
 * un pesaje de un día anterior que se les pasó (ver spec del handoff).
 */
export function buildRecordedAtForDate(dateStr: string): string {
  const [y, m, d] = parseDateString(dateStr);
  const bogotaNow = new Date(Date.now() - BOGOTA_OFFSET_MS);
  const bogotaTargetAsUtcMs = Date.UTC(
    y,
    m - 1,
    d,
    bogotaNow.getUTCHours(),
    bogotaNow.getUTCMinutes(),
    bogotaNow.getUTCSeconds(),
    bogotaNow.getUTCMilliseconds()
  );
  return new Date(bogotaTargetAsUtcMs + BOGOTA_OFFSET_MS).toISOString();
}
