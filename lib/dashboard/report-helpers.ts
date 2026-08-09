import type { ReportAssessment, ReportPlayer } from "@/lib/dashboard/report-queries";

export const LATEST = "__latest__";
export const ALL = "__all__";

export function groupAssessmentsByPlayer(
  assessments: ReportAssessment[]
): Map<string, ReportAssessment[]> {
  const map = new Map<string, ReportAssessment[]>();
  for (const assessment of assessments) {
    const list = map.get(assessment.player_id);
    if (list) {
      list.push(assessment);
    } else {
      map.set(assessment.player_id, [assessment]);
    }
  }
  return map;
}

/**
 * Opciones del filtro "Valoración": las etiquetas (label) usadas en algún
 * momento por cualquier jugador, más recientes primero -- es el único
 * identificador de "ronda" que existe hoy (no hay una tabla de rondas
 * separada). Si la nutricionista no etiqueta consistente entre jugadores en
 * la misma ronda, el filtro puede mostrar menos jugadores de los esperados
 * para esa etiqueta -- limitación conocida del esquema actual, no un bug.
 */
export function buildValoracionOptions(
  assessments: ReportAssessment[]
): { label: string; date: string }[] {
  const mostRecentByLabel = new Map<string, string>();
  for (const assessment of assessments) {
    const current = mostRecentByLabel.get(assessment.label);
    if (!current || assessment.assessment_date > current) {
      mostRecentByLabel.set(assessment.label, assessment.assessment_date);
    }
  }
  return [...mostRecentByLabel.entries()]
    .map(([label, date]) => ({ label, date }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export type PlayerAssessmentPair = { player: ReportPlayer; assessment: ReportAssessment };

/**
 * Por cada jugador (ya filtrado por posición/categoría), la valoración
 * seleccionada: la más reciente por defecto (valoracionLabel === LATEST), o
 * la última con esa etiqueta puntual si se eligió una ronda específica. Un
 * jugador sin ninguna valoración que matchee queda fuera del resultado --
 * no tiene sentido graficar/tabular una fila sin dato.
 */
export function selectPlayerAssessments({
  players,
  assessmentsByPlayer,
  categoryId,
  positionId,
  valoracionLabel,
}: {
  players: ReportPlayer[];
  assessmentsByPlayer: Map<string, ReportAssessment[]>;
  categoryId: string;
  positionId: string;
  valoracionLabel: string;
}): PlayerAssessmentPair[] {
  const result: PlayerAssessmentPair[] = [];

  for (const player of players) {
    if (categoryId !== ALL && player.category?.id !== categoryId) continue;
    if (positionId !== ALL && player.position?.id !== positionId) continue;

    const list = assessmentsByPlayer.get(player.id);
    if (!list || list.length === 0) continue;

    const assessment =
      valoracionLabel === LATEST
        ? list[list.length - 1]
        : [...list].reverse().find((a) => a.label === valoracionLabel);

    if (!assessment) continue;
    result.push({ player, assessment });
  }

  return result;
}

export type TopNDirection = "best" | "worst" | null;

/**
 * "Mejores" = valores más bajos de la métrica primero, "Peores" = más
 * altos primero -- convención literal (no un juicio de valor fisiológico)
 * aplicada igual en las 4 visualizaciones con Top N; si para alguna métrica
 * el sentido debería ser al revés (ej. AKS), es un cambio de una línea.
 */
export function applyTopN<T>(
  items: T[],
  getValue: (item: T) => number | null,
  direction: TopNDirection,
  n: number
): T[] {
  if (!direction) return items;

  const sorted = [...items].sort((a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return direction === "best" ? va - vb : vb - va;
  });

  return sorted.slice(0, n);
}

export type SortDirection = "asc" | "desc";

/**
 * Orden de despliegue de un gráfico de columnas (control "mayor a menor" /
 * "menor a mayor") -- distinto y aplicado DESPUÉS de applyTopN(): Top N
 * decide qué jugadores entran, esto decide en qué orden se dibujan. Mismo
 * criterio de nulls-al-final que applyTopN().
 */
export function sortByValue<T>(
  items: T[],
  getValue: (item: T) => number | null,
  direction: SortDirection
): T[] {
  return [...items].sort((a, b) => {
    const va = getValue(a);
    const vb = getValue(b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return direction === "asc" ? va - vb : vb - va;
  });
}

/**
 * "Adrián Martínez" -> "Adrián M." -- para el eje X de los gráficos de
 * columnas (referencia: gráficos compactos, pocos labels, sin ruido
 * visual). El nombre completo se sigue mostrando en el tooltip al pasar el
 * mouse; esto es solo para el tick del eje.
 */
export function shortenName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return fullName;
  const lastInitial = parts[parts.length - 1][0];
  return `${parts[0]} ${lastInitial}.`;
}
