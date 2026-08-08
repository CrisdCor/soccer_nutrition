import { computeMuscleMassAge } from "./age";
import { computeSkinfoldSum6 } from "./skinfolds";
import { computeCorrectedGirth } from "./corrected-girths";
import { computeBoneMassKg } from "./bone-mass";
import { computeMuscleMassKg } from "./muscle-mass";
import { computeFatPercentage, computeFatMassKg, computeFatFreeMassKg } from "./fat";
import { computeAdiposeMassKg } from "./adipose-mass";
import { computeResidualMassKg } from "./residual-mass";
import { computeMassPercentage, computeResidualPercentage } from "./percentages";
import { computeBmi } from "./bmi";
import { computeAksIndex } from "./aks";
import type { PlayerSex } from "./types";

export { computeDisplayAge, computeMuscleMassAge } from "./age";
export type { PlayerSex } from "./types";

export type RawMeasurements = {
  weightKg: number | null;
  heightCm: number | null;
  skinfoldTriceps: number | null;
  skinfoldSubscapular: number | null;
  skinfoldSupraspinal: number | null;
  skinfoldAbdominal: number | null;
  skinfoldThigh: number | null;
  skinfoldCalf: number | null;
  girthRelaxedArm: number | null;
  girthThigh: number | null;
  girthCalf: number | null;
  diameterBistyloid: number | null;
  diameterFemur: number | null;
};

export type PlayerContext = {
  sex: PlayerSex;
  birthDate: Date;
  raceMuscleConstant: number;
};

export type AssessmentIndicators = {
  skinfoldSum6: number | null;
  correctedArmGirth: number | null;
  correctedThighGirth: number | null;
  correctedCalfGirth: number | null;
  boneMassKg: number | null;
  muscleMassKg: number | null;
  fatPercentage: number | null;
  fatMassKg: number | null;
  fatFreeMassKg: number | null;
  adiposeMassKg: number | null;
  residualMassKg: number | null;
  musclePercentage: number | null;
  bonePercentage: number | null;
  adiposePercentage: number | null;
  residualPercentage: number | null;
  bmi: number | null;
  aksIndex: number | null;
};

function round(value: number | null, decimals: number): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Calcula todos los indicadores derivados de una valoración a partir de las
 * medidas crudas capturadas y el contexto del jugador (sexo, nacimiento,
 * constante de raza). Cada indicador es independiente: si a alguno le faltan
 * datos de entrada, queda `null` (no se propaga en cascada como 0 ni se
 * calcula parcialmente asumiendo el resto).
 */
export function computeAssessmentIndicators(
  raw: RawMeasurements,
  player: PlayerContext,
  assessmentDate: Date
): AssessmentIndicators {
  const skinfoldSum6 = computeSkinfoldSum6({
    triceps: raw.skinfoldTriceps,
    subscapular: raw.skinfoldSubscapular,
    supraspinal: raw.skinfoldSupraspinal,
    abdominal: raw.skinfoldAbdominal,
    thigh: raw.skinfoldThigh,
    calf: raw.skinfoldCalf,
  });

  const correctedArmGirth = computeCorrectedGirth(raw.girthRelaxedArm, raw.skinfoldTriceps);
  const correctedThighGirth = computeCorrectedGirth(raw.girthThigh, raw.skinfoldThigh);
  const correctedCalfGirth = computeCorrectedGirth(raw.girthCalf, raw.skinfoldCalf);

  const boneMassKg = computeBoneMassKg({
    heightCm: raw.heightCm,
    diameterBistyloidCm: raw.diameterBistyloid,
    diameterFemurCm: raw.diameterFemur,
  });

  const muscleMassAgeYears = computeMuscleMassAge(player.birthDate, assessmentDate);

  const muscleMassKg = computeMuscleMassKg({
    heightCm: raw.heightCm,
    correctedArmGirth,
    correctedThighGirth,
    correctedCalfGirth,
    sex: player.sex,
    ageYears: muscleMassAgeYears,
    raceMuscleConstant: player.raceMuscleConstant,
  });

  const fatPercentage = computeFatPercentage({ skinfoldSum6, sex: player.sex });
  const fatMassKg = computeFatMassKg(raw.weightKg, fatPercentage);
  const fatFreeMassKg = computeFatFreeMassKg(raw.weightKg, fatMassKg);

  const adiposeMassKg = computeAdiposeMassKg({ skinfoldSum6, heightCm: raw.heightCm });

  const residualMassKg = computeResidualMassKg({
    weightKg: raw.weightKg,
    muscleMassKg,
    adiposeMassKg,
    boneMassKg,
  });

  const musclePercentage = computeMassPercentage(muscleMassKg, raw.weightKg);
  const bonePercentage = computeMassPercentage(boneMassKg, raw.weightKg);
  const adiposePercentage = computeMassPercentage(adiposeMassKg, raw.weightKg);
  const residualPercentage = computeResidualPercentage({
    musclePercentage,
    adiposePercentage,
    bonePercentage,
  });

  const bmi = computeBmi(raw.weightKg, raw.heightCm);
  const aksIndex = computeAksIndex(fatFreeMassKg, raw.heightCm);

  return {
    skinfoldSum6: round(skinfoldSum6, 1),
    correctedArmGirth: round(correctedArmGirth, 2),
    correctedThighGirth: round(correctedThighGirth, 2),
    correctedCalfGirth: round(correctedCalfGirth, 2),
    boneMassKg: round(boneMassKg, 2),
    muscleMassKg: round(muscleMassKg, 2),
    fatPercentage: round(fatPercentage, 4),
    fatMassKg: round(fatMassKg, 2),
    fatFreeMassKg: round(fatFreeMassKg, 2),
    adiposeMassKg: round(adiposeMassKg, 2),
    residualMassKg: round(residualMassKg, 2),
    musclePercentage: round(musclePercentage, 4),
    bonePercentage: round(bonePercentage, 4),
    adiposePercentage: round(adiposePercentage, 4),
    residualPercentage: round(residualPercentage, 4),
    bmi: round(bmi, 2),
    aksIndex: round(aksIndex, 2),
  };
}
