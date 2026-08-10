import type { CurrentThresholds } from "@/lib/configuracion/queries";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";
import type { ReportAssessment, ReportGroupPlayer } from "@/lib/reportes/queries";

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
  categoryName: string;
  valoracionLabel: string;
  generatedAtLabel: string;
  generatedByName: string;
  generatedByRoleTitle: string;
  shieldDataUri: string | null;
  thresholds: CurrentThresholds;
  players: ReportPlayerData[];
  catalogs: ReportCatalogs;
};
