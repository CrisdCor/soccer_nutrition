import type { PlayerSex } from "./types";

/**
 * Masa Muscular (kg) — fórmula de Lee (2000):
 * Talla/100 × (0.00744×PRBrazoCorr² + 0.00088×PRMusloCorr² + 0.00441×PRPiernaCorr²)
 *   + 2.4×(1 si Hombre, 0 si Mujer) − 0.048×edad_años + Constante_Raza + 7.8
 *
 * `ageYears` debe venir de computeMuscleMassAge (días entre valoración y
 * nacimiento / 365.25), no de computeDisplayAge. `raceMuscleConstant` viene
 * de races.muscle_mass_constant.
 */
export function computeMuscleMassKg(input: {
  heightCm: number | null;
  correctedArmGirth: number | null;
  correctedThighGirth: number | null;
  correctedCalfGirth: number | null;
  sex: PlayerSex | null;
  ageYears: number | null;
  raceMuscleConstant: number | null;
}): number | null {
  const {
    heightCm,
    correctedArmGirth,
    correctedThighGirth,
    correctedCalfGirth,
    sex,
    ageYears,
    raceMuscleConstant,
  } = input;

  if (
    heightCm == null ||
    correctedArmGirth == null ||
    correctedThighGirth == null ||
    correctedCalfGirth == null ||
    sex == null ||
    ageYears == null ||
    raceMuscleConstant == null
  ) {
    return null;
  }

  const heightM = heightCm / 100;
  const sexTerm = sex === "Hombre" ? 2.4 : 0;

  return (
    heightM *
      (0.00744 * correctedArmGirth ** 2 +
        0.00088 * correctedThighGirth ** 2 +
        0.00441 * correctedCalfGirth ** 2) +
    sexTerm -
    0.048 * ageYears +
    raceMuscleConstant +
    7.8
  );
}
