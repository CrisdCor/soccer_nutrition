/** IMC = Peso / (Talla/100)² */
export function computeBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (weightKg == null || heightCm == null || heightCm === 0) return null;
  const heightM = heightCm / 100;
  return weightKg / heightM ** 2;
}
