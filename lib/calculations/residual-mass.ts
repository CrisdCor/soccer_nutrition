/** Masa Residual (kg) = Peso − Masa Muscular − Masa Adiposa − Masa Ósea */
export function computeResidualMassKg(input: {
  weightKg: number | null;
  muscleMassKg: number | null;
  adiposeMassKg: number | null;
  boneMassKg: number | null;
}): number | null {
  const { weightKg, muscleMassKg, adiposeMassKg, boneMassKg } = input;

  if (weightKg == null || muscleMassKg == null || adiposeMassKg == null || boneMassKg == null) {
    return null;
  }

  return weightKg - muscleMassKg - adiposeMassKg - boneMassKg;
}
