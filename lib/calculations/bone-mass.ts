/**
 * Masa Ósea (kg) — fórmula de Rocha:
 * 3.02 × ((Talla/100)² × (D Bies/100) × (D Fém/100) × 400)^0.712
 */
export function computeBoneMassKg(input: {
  heightCm: number | null;
  diameterBistyloidCm: number | null;
  diameterFemurCm: number | null;
}): number | null {
  const { heightCm, diameterBistyloidCm, diameterFemurCm } = input;

  if (heightCm == null || diameterBistyloidCm == null || diameterFemurCm == null) {
    return null;
  }

  const heightM = heightCm / 100;
  const bistyloidM = diameterBistyloidCm / 100;
  const femurM = diameterFemurCm / 100;

  const base = heightM ** 2 * bistyloidM * femurM * 400;
  return 3.02 * base ** 0.712;
}
