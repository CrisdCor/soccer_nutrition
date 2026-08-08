/** % de una masa = masa (kg) / Peso. */
export function computeMassPercentage(
  massKg: number | null,
  weightKg: number | null
): number | null {
  if (massKg == null || weightKg == null || weightKg === 0) return null;
  return massKg / weightKg;
}

/** % Masa Residual = 1 − %Muscular − %Adiposa − %Ósea (por diferencia). */
export function computeResidualPercentage(input: {
  musclePercentage: number | null;
  adiposePercentage: number | null;
  bonePercentage: number | null;
}): number | null {
  const { musclePercentage, adiposePercentage, bonePercentage } = input;

  if (musclePercentage == null || adiposePercentage == null || bonePercentage == null) {
    return null;
  }

  return 1 - musclePercentage - adiposePercentage - bonePercentage;
}
