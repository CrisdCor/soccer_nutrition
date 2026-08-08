/**
 * Edad para mostrar en UI: años + meses/12, redondeada a 2 decimales.
 * Ej: 24 años y 6 meses -> 24.50. No se almacena, se calcula al vuelo.
 */
export function computeDisplayAge(birthDate: Date, atDate: Date = new Date()): number {
  let years = atDate.getFullYear() - birthDate.getFullYear();
  let months = atDate.getMonth() - birthDate.getMonth();

  if (atDate.getDate() < birthDate.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return Math.round((years + months / 12) * 100) / 100;
}

/**
 * Edad en años usada específicamente por la fórmula de Masa Muscular (Lee, 2000):
 * (fecha de la valoración − fecha de nacimiento) / 365.25.
 * Deliberadamente distinta de computeDisplayAge (que usa años + meses/12).
 */
export function computeMuscleMassAge(birthDate: Date, assessmentDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = (assessmentDate.getTime() - birthDate.getTime()) / msPerDay;
  return days / 365.25;
}
