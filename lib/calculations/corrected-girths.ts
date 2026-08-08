/**
 * Perímetro corregido = perímetro relajado − π×(pliegue/10).
 * Se usa igual para brazo, muslo y pierna (cada uno con su propio pliegue).
 */
export function computeCorrectedGirth(
  girthCm: number | null,
  skinfoldMm: number | null
): number | null {
  if (girthCm == null || skinfoldMm == null) return null;
  return girthCm - Math.PI * (skinfoldMm / 10);
}
