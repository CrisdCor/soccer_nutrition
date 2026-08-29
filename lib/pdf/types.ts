import type { CurrentThresholds } from "@/lib/configuracion/queries";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";
import type { PlayerAksHistoryPoint, ReportAssessment, ReportGroupPlayer } from "@/lib/reportes/queries";

export type ReportCatalogOption = { id: string; name: string };
export type ReportMealType = { id: number; name: string; sort_order: number };

export type ReportCatalogs = {
  dietTypes: ReportCatalogOption[];
  foodGroups: ReportCatalogOption[];
  mealTypes: ReportMealType[];
};

export type ReportPlayerData = {
  player: ReportGroupPlayer;
  photoDataUri: string | null;
  assessment: ReportAssessment;
  plan: NutritionPlanFull | null;
};

export type ReportDocumentData = {
  /** "grupal": tabla grupal + una página por jugador de la categoría.
   *  "individual": sin tabla grupal, `players` siempre trae un solo elemento. */
  mode: "grupal" | "individual";
  /** Nombre de la categoría (grupal) o del jugador (individual) -- mismo
   *  slot de la portada en los dos modos, ver lib/pdf/cover-page.tsx. */
  categoryName: string;
  valoracionLabel: string;
  generatedAtLabel: string;
  generatedByName: string;
  generatedByRoleTitle: string;
  shieldDataUri: string | null;
  thresholds: CurrentThresholds;
  players: ReportPlayerData[];
  catalogs: ReportCatalogs;
  /** Historial completo de Índice AKS del jugador (todas sus valoraciones,
   *  no solo `valoracionLabel`) para el gráfico de evolución del PDF
   *  individual -- ver lib/pdf/aks-evolution-chart.tsx. null en modo
   *  "grupal" (no aplica, ver AGENTS.md del feature) y también en modo
   *  "individual" cuando el jugador tiene una sola valoración (nada que
   *  comparar, el PlayerPage omite el gráfico directamente). */
  aksHistory: PlayerAksHistoryPoint[] | null;
};
