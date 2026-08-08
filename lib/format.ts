/**
 * Formatea un indicador calculado. Un valor null significa "dato
 * insuficiente" (no 0) — así debe mostrarse siempre, nunca como "0".
 */
export function formatIndicator(value: number | null, decimals = 2, suffix = ""): string {
  if (value == null) return "Dato insuficiente";
  return `${value.toFixed(decimals)}${suffix}`;
}

export function formatPercentage(value: number | null, decimals = 1): string {
  if (value == null) return "Dato insuficiente";
  return `${(value * 100).toFixed(decimals)}%`;
}
