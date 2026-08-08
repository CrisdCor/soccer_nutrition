import type { PlayerSex } from "./types";

/**
 * % Masa Grasa — fórmula de Yuhasz:
 * Hombre: (Suma6Pliegues×0.1051 + 2.585) / 100
 * Mujer:  (Suma6Pliegues×0.1548 + 3.58)  / 100
 */
export function computeFatPercentage(input: {
  skinfoldSum6: number | null;
  sex: PlayerSex | null;
}): number | null {
  const { skinfoldSum6, sex } = input;
  if (skinfoldSum6 == null || sex == null) return null;

  return sex === "Hombre"
    ? (skinfoldSum6 * 0.1051 + 2.585) / 100
    : (skinfoldSum6 * 0.1548 + 3.58) / 100;
}

/** Masa Grasa (kg) = Peso × %MasaGrasa */
export function computeFatMassKg(
  weightKg: number | null,
  fatPercentage: number | null
): number | null {
  if (weightKg == null || fatPercentage == null) return null;
  return weightKg * fatPercentage;
}

/** Masa Libre de Grasa (kg) = Peso − Masa Grasa (kg) */
export function computeFatFreeMassKg(
  weightKg: number | null,
  fatMassKg: number | null
): number | null {
  if (weightKg == null || fatMassKg == null) return null;
  return weightKg - fatMassKg;
}
