/**
 * Suma 6 Pliegues = Tríceps + Subescapular + Supraespinal + Abdominal + Muslo + Pierna.
 * Excluye Bíceps y Cresta ilíaca (reservados para un escalamiento futuro).
 *
 * Si falta cualquiera de los 6, el resultado es null (dato insuficiente ≠ 0):
 * nunca se trata un pliegue faltante como 0 para poder sumar igual.
 */
export function computeSkinfoldSum6(input: {
  triceps: number | null;
  subscapular: number | null;
  supraspinal: number | null;
  abdominal: number | null;
  thigh: number | null;
  calf: number | null;
}): number | null {
  const { triceps, subscapular, supraspinal, abdominal, thigh, calf } = input;

  if (
    triceps == null ||
    subscapular == null ||
    supraspinal == null ||
    abdominal == null ||
    thigh == null ||
    calf == null
  ) {
    return null;
  }

  return triceps + subscapular + supraspinal + abdominal + thigh + calf;
}
