/**
 * Masa Adiposa (kg):
 * ((((Suma6Pli×(170.18/Talla) − 116.41) / 34.79) × 5.85 + 25.6) / (170.18/Talla)^3)
 */
export function computeAdiposeMassKg(input: {
  skinfoldSum6: number | null;
  heightCm: number | null;
}): number | null {
  const { skinfoldSum6, heightCm } = input;
  if (skinfoldSum6 == null || heightCm == null || heightCm === 0) return null;

  const ratio = 170.18 / heightCm;
  const inner = ((skinfoldSum6 * ratio - 116.41) / 34.79) * 5.85 + 25.6;
  return inner / ratio ** 3;
}
