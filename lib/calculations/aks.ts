/**
 * AKS = (Masa Libre de Grasa × 100000) / Talla³
 * Se compara contra los umbrales de reference_thresholds (metric = 'aks_index').
 */
export function computeAksIndex(
  fatFreeMassKg: number | null,
  heightCm: number | null
): number | null {
  if (fatFreeMassKg == null || heightCm == null || heightCm === 0) return null;
  return (fatFreeMassKg * 100000) / heightCm ** 3;
}
