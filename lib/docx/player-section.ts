import { ImageRun, Paragraph, Table, TableRow, TextRun, WidthType } from "docx";
import { computeDisplayAge } from "@/lib/calculations";
import { classifyByThreshold, formatClassification, formatIndicator, formatPercentage } from "@/lib/format";
import { buildAksChartPng } from "@/lib/docx/aks-chart-image";
import { COLORS, FONT } from "@/lib/docx/styles";
import { textCell } from "@/lib/docx/table-helpers";
import { buildMeasurementGroups, type MeasurementGroup } from "@/lib/pdf/measurement-groups";
import type { ReportCatalogs, ReportDocumentData, ReportPlayerData } from "@/lib/pdf/types";
import type { NutritionPlanFull } from "@/lib/nutricion/queries";
import { getAdjustmentLabel, getDietTypeNames, getFoodGroupRowTotal } from "@/lib/reportes/plan-view-model";

/**
 * Una "página" por jugador (en Word no hay control de paginación explícito
 * como en @react-pdf/renderer -- el contenido fluye y Word pagina solo;
 * pageBreakBefore en el primer párrafo fuerza el arranque en página nueva).
 * Replica la misma información que lib/pdf/player-page.tsx (encabezado +
 * indicadores, mediciones, diagnóstico, plan completo), con un layout más
 * simple: tablas de 2 columnas en vez de la grilla de tarjetas del PDF.
 */
export async function buildPlayerSectionChildren(
  row: ReportPlayerData,
  data: ReportDocumentData
): Promise<(Paragraph | Table)[]> {
  const { player, assessment, plan } = row;
  const age = computeDisplayAge(new Date(player.birth_date), new Date(assessment.assessment_date));
  const groups = buildMeasurementGroups(assessment);

  const fatClassification = formatClassification(
    classifyByThreshold(assessment.skinfold_sum_6, data.thresholds.skinfold_sum)
  );
  const aksClassification = formatClassification(classifyByThreshold(assessment.aks_index, data.thresholds.aks_index));

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      pageBreakBefore: true,
      spacing: { after: 40 },
      children: [new TextRun({ text: player.full_name, font: FONT, bold: true, size: 28, color: COLORS.foreground })],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: `${assessment.label} · ${assessment.assessment_date}`,
          font: FONT,
          size: 17,
          color: COLORS.muted,
        }),
      ],
    }),
    statsParagraph([
      ["Posición", player.position?.name ?? "—"],
      ["Edad", String(age)],
      ["Peso", formatIndicator(assessment.weight_kg, 1, " kg")],
      ["Talla", formatIndicator(assessment.height_cm, 1, " cm")],
      ["IMC", formatIndicator(assessment.bmi, 2)],
      ["% Grasa (Yuhasz)", `${formatPercentage(assessment.fat_percentage)} · ${fatClassification}`],
      ["IAKS", `${formatIndicator(assessment.aks_index, 2)} · ${aksClassification}`],
    ]),
  ];

  // Mismo criterio y mismo punto del documento que PlayerPage en el PDF
  // (ver lib/pdf/player-page.tsx): solo en modo "individual" y solo si hay
  // más de una valoración para comparar -- si no, se omite sin dejar
  // ningún rastro (ni encabezado ni espacio vacío).
  if (data.mode === "individual" && data.aksHistory && data.aksHistory.length > 1) {
    const chart = await buildAksChartPng(data.aksHistory, assessment.id, data.thresholds.aks_index);
    if (chart) {
      children.push(
        heading("Evolución · Índice AKS"),
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new ImageRun({ type: "png", data: chart.buffer, transformation: { width: chart.width, height: chart.height } }),
          ],
        })
      );
    }
  }

  children.push(heading("Mediciones de la valoración"));
  for (const group of groups) {
    children.push(subheading(group.title), measurementGroupTable(group), spacer());
  }

  children.push(heading("Diagnóstico nutricional"), bodyParagraph(plan?.nutritional_diagnosis || "Sin diagnóstico registrado."));

  if (plan) {
    children.push(...buildPlanSections(plan, data.catalogs));
  } else {
    children.push(mutedParagraph("Plan de alimentación no registrado"));
  }

  return children;
}

function buildPlanSections(plan: NutritionPlanFull, catalogs: ReportCatalogs): (Paragraph | Table)[] {
  const dietTypeNames = getDietTypeNames(plan, catalogs);
  const adjustmentLabel = getAdjustmentLabel(plan);

  const children: (Paragraph | Table)[] = [
    heading("Tipo de dieta"),
    bodyParagraph(dietTypeNames.length > 0 ? dietTypeNames.join(", ") : "Sin tipo de dieta seleccionado."),
  ];
  if (plan.diet_type_observation) children.push(mutedParagraph(plan.diet_type_observation));

  children.push(
    heading("Requerimiento energético"),
    statsParagraph([
      ["Requerimiento", formatIndicator(plan.energy_requirement_kcal, 0, " kcal/día")],
      ["Ajuste calórico", adjustmentLabel ?? "Dato insuficiente"],
    ]),
    heading("Distribución de energía y macronutrientes"),
    buildMacrosTable(plan),
    spacer(),
    heading("Porciones por grupo de alimento y comida"),
    buildPortionsTable(plan, catalogs),
    spacer(),
    heading("Ejemplo de menú")
  );

  for (const mealType of catalogs.mealTypes) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `${mealType.name}: `, font: FONT, bold: true, size: 17 }),
          new TextRun({ text: plan.menuExamples[mealType.id] || "Sin ejemplo registrado.", font: FONT, size: 17 }),
        ],
      })
    );
  }

  children.push(
    heading("Recomendaciones generales"),
    bodyParagraph(plan.general_recommendations || "Sin recomendaciones registradas.")
  );

  return children;
}

function buildMacrosTable(plan: NutritionPlanFull): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell("Componente", { widthPct: 40, header: true }),
      textCell("Gramos / kcal", { widthPct: 30, header: true }),
      textCell("g / kg", { widthPct: 30, header: true }),
    ],
  });

  const dataRows: [string, string, string][] = [
    ["Energía", formatIndicator(plan.energy_distribution_kcal, 0, " kcal"), "—"],
    ["Proteína", formatIndicator(plan.protein_g, 1, " g"), formatIndicator(plan.protein_g_per_kg, 2)],
    ["Grasa", formatIndicator(plan.fat_g, 1, " g"), formatIndicator(plan.fat_g_per_kg, 2)],
    ["Carbohidratos", formatIndicator(plan.carbs_g, 1, " g"), formatIndicator(plan.carbs_g_per_kg, 2)],
  ];

  const rows = dataRows.map(
    ([label, a, b]) =>
      new TableRow({
        children: [
          textCell(label, { widthPct: 40 }),
          textCell(a, { widthPct: 30 }),
          textCell(b, { widthPct: 30 }),
        ],
      })
  );

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] });
}

function buildPortionsTable(plan: NutritionPlanFull, catalogs: ReportCatalogs): Table {
  const mealColWidth = 60 / Math.max(catalogs.mealTypes.length, 1);

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell("Grupo de alimento", { widthPct: 30, header: true }),
      ...catalogs.mealTypes.map((mealType) => textCell(mealType.name, { widthPct: mealColWidth, header: true })),
      textCell("Total", { widthPct: 10, header: true }),
    ],
  });

  const rows = catalogs.foodGroups.map(
    (foodGroup) =>
      new TableRow({
        children: [
          textCell(foodGroup.name, { widthPct: 30 }),
          ...catalogs.mealTypes.map((mealType) =>
            textCell(String(plan.portions[`${foodGroup.id}:${mealType.id}`] ?? 0), { widthPct: mealColWidth })
          ),
          textCell(String(getFoodGroupRowTotal(plan, catalogs, foodGroup.id)), { widthPct: 10, bold: true }),
        ],
      })
  );

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] });
}

function measurementGroupTable(group: MeasurementGroup): Table {
  const rows: TableRow[] = [];
  for (let i = 0; i < group.fields.length; i += 2) {
    const first = group.fields[i];
    const second = group.fields[i + 1];
    rows.push(
      new TableRow({
        children: [
          textCell(first.label, { widthPct: 20 }),
          textCell(first.value, { widthPct: 30, bold: true }),
          textCell(second?.label ?? "", { widthPct: 20 }),
          textCell(second?.value ?? "", { widthPct: 30, bold: true }),
        ],
      })
    );
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

function heading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, font: FONT, bold: true, size: 20, color: COLORS.foreground })],
  });
}

function subheading(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text, font: FONT, size: 15, color: COLORS.muted })],
  });
}

function bodyParagraph(text: string): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, font: FONT, size: 18 })] });
}

function mutedParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: FONT, italics: true, size: 18, color: COLORS.muted })],
  });
}

function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 160 }, children: [] });
}

function statsParagraph(pairs: [string, string][]): Paragraph {
  const runs: TextRun[] = [];
  pairs.forEach(([label, value], index) => {
    if (index > 0) runs.push(new TextRun({ text: "    ", font: FONT, size: 17 }));
    runs.push(new TextRun({ text: `${label}: `, font: FONT, bold: true, size: 17 }));
    runs.push(new TextRun({ text: value, font: FONT, size: 17 }));
  });
  return new Paragraph({ spacing: { after: 200 }, children: runs });
}
