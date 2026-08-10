import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { computeDisplayAge } from "@/lib/calculations";
import { classifyByThreshold, formatClassification, formatIndicator, formatPercentage } from "@/lib/format";
import { buildMeasurementGroups } from "@/lib/pdf/measurement-groups";
import { COLORS, sharedStyles } from "@/lib/pdf/styles";
import type { ReportDocumentData, ReportPlayerData } from "@/lib/pdf/types";

const styles = StyleSheet.create({
  page: sharedStyles.page,
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  photo: {
    width: 60,
    height: 60,
    marginRight: 14,
    objectFit: "cover",
    borderRadius: 4,
  },
  photoPlaceholder: {
    width: 60,
    height: 60,
    marginRight: 14,
    borderRadius: 4,
    backgroundColor: COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitials: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.blue,
  },
  headerInfo: { flex: 1 },
  playerName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.foreground,
  },
  playerSubtitle: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  statItem: {
    width: "25%",
    marginBottom: 6,
    paddingRight: 8,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.muted,
  },
  statValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 1,
  },
  measurementGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  measurementBox: {
    width: "25%",
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 5,
  },
  measurementLabel: {
    fontSize: 6.5,
    color: COLORS.muted,
  },
  measurementValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginTop: 1,
  },
  paragraph: {
    fontSize: 8.5,
    lineHeight: 1.5,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    fontSize: 7.5,
    color: COLORS.blue,
    backgroundColor: COLORS.blueSoft,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.muted,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
  },
  tableCell: {
    fontSize: 7.5,
    paddingHorizontal: 4,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  menuBox: {
    width: "50%",
    paddingRight: 8,
    marginBottom: 8,
  },
  menuBoxLabel: {
    fontSize: 7,
    color: COLORS.muted,
  },
  menuBoxValue: {
    fontSize: 8,
    marginTop: 2,
    lineHeight: 1.4,
  },
  noPlanBox: {
    borderWidth: 0.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: 14,
    alignItems: "center",
  },
  noPlanText: {
    fontSize: 9,
    color: COLORS.muted,
  },
});

/**
 * Una página (o más, si el contenido no entra en una física -- @react-pdf
 * pagina automáticamente el desborde de un <Page>) por jugador: replica la
 * estructura del panel "Ver detalle" + tab "Plan Nutricional" en pantalla,
 * ver AssessmentDetailGroups y NutritionPlanReport.
 */
export function PlayerPage({ row, data }: { row: ReportPlayerData; data: ReportDocumentData }) {
  const { player, assessment, plan, photoDataUri } = row;
  const age = computeDisplayAge(new Date(player.birth_date), new Date(assessment.assessment_date));
  const groups = buildMeasurementGroups(assessment);

  const fatClassification = formatClassification(
    classifyByThreshold(assessment.skinfold_sum_6, data.thresholds.skinfold_sum)
  );
  const aksClassification = formatClassification(
    classifyByThreshold(assessment.aks_index, data.thresholds.aks_index)
  );

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.headerRow}>
        {photoDataUri ? (
          // Image de @react-pdf/renderer (documento PDF, no HTML): no acepta alt.
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={photoDataUri} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoInitials}>{getInitials(player.full_name)}</Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.playerName}>{player.full_name}</Text>
          <Text style={styles.playerSubtitle}>
            {assessment.label} · {assessment.assessment_date}
          </Text>

          <View style={styles.statsRow}>
            <Stat label="Posición" value={player.position?.name ?? "—"} />
            <Stat label="Edad" value={String(age)} />
            <Stat label="Peso" value={formatIndicator(assessment.weight_kg, 1, " kg")} />
            <Stat label="Talla" value={formatIndicator(assessment.height_cm, 1, " cm")} />
            <Stat label="IMC" value={formatIndicator(assessment.bmi, 2)} />
            <Stat
              label="% Grasa (Yuhasz)"
              value={`${formatPercentage(assessment.fat_percentage)} · ${fatClassification}`}
            />
            <Stat label="IAKS" value={`${formatIndicator(assessment.aks_index, 2)} · ${aksClassification}`} />
          </View>
        </View>
      </View>

      <View style={sharedStyles.section}>
        <Text style={sharedStyles.h2}>Mediciones de la valoración</Text>
        {groups.map((group) => (
          <View key={group.title} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={[sharedStyles.muted, { fontSize: 7.5, marginBottom: 3 }]}>{group.title}</Text>
            <View style={styles.measurementGrid}>
              {group.fields.map((field) => (
                <View key={field.label} style={styles.measurementBox}>
                  <Text style={styles.measurementLabel}>{field.label}</Text>
                  <Text style={styles.measurementValue}>{field.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={sharedStyles.section} wrap={false}>
        <Text style={sharedStyles.h2}>Diagnóstico nutricional</Text>
        <Text style={styles.paragraph}>{plan?.nutritional_diagnosis || "Sin diagnóstico registrado."}</Text>
      </View>

      {plan ? (
        <PlanSections plan={plan} catalogs={data.catalogs} />
      ) : (
        <View style={styles.noPlanBox}>
          <Text style={styles.noPlanText}>Plan de alimentación no registrado</Text>
        </View>
      )}
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function PlanSections({
  plan,
  catalogs,
}: {
  plan: NonNullable<ReportPlayerData["plan"]>;
  catalogs: ReportDocumentData["catalogs"];
}) {
  const dietTypeNames = plan.dietTypeIds
    .map((id) => catalogs.dietTypes.find((d) => d.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const adjustmentLabel =
    plan.caloric_adjustment_kcal == null
      ? null
      : plan.caloric_adjustment_kcal < 0
        ? `Déficit de ${Math.abs(plan.caloric_adjustment_kcal)} kcal`
        : `Superávit de ${plan.caloric_adjustment_kcal} kcal`;

  const rowTotal = (foodGroupId: string) =>
    catalogs.mealTypes.reduce((sum, mealType) => sum + (plan.portions[`${foodGroupId}:${mealType.id}`] ?? 0), 0);

  const mealColWidth = 60 / Math.max(catalogs.mealTypes.length, 1);

  return (
    <>
      <View style={sharedStyles.section} wrap={false}>
        <Text style={sharedStyles.h2}>Tipo de dieta</Text>
        {dietTypeNames.length > 0 ? (
          <View style={styles.chipsRow}>
            {dietTypeNames.map((name) => (
              <Text key={name} style={styles.chip}>
                {name}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={[styles.paragraph, sharedStyles.muted]}>Sin tipo de dieta seleccionado.</Text>
        )}
        {plan.diet_type_observation ? (
          <Text style={[styles.paragraph, sharedStyles.muted, { marginTop: 4 }]}>{plan.diet_type_observation}</Text>
        ) : null}
      </View>

      <View style={sharedStyles.section} wrap={false}>
        <Text style={sharedStyles.h2}>Requerimiento energético</Text>
        <View style={styles.statsRow}>
          <Stat label="Requerimiento" value={formatIndicator(plan.energy_requirement_kcal, 0, " kcal/día")} />
          <Stat label="Ajuste calórico" value={adjustmentLabel ?? "Dato insuficiente"} />
        </View>
      </View>

      <View style={sharedStyles.section} wrap={false}>
        <Text style={sharedStyles.h2}>Distribución de energía y macronutrientes</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { width: "40%" }]}>Componente</Text>
          <Text style={[styles.tableHeaderCell, { width: "30%" }]}>Gramos / kcal</Text>
          <Text style={[styles.tableHeaderCell, { width: "30%" }]}>g / kg</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: "40%" }]}>Energía</Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>
            {formatIndicator(plan.energy_distribution_kcal, 0, " kcal")}
          </Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>—</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: "40%" }]}>Proteína</Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>{formatIndicator(plan.protein_g, 1, " g")}</Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>{formatIndicator(plan.protein_g_per_kg, 2)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: "40%" }]}>Grasa</Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>{formatIndicator(plan.fat_g, 1, " g")}</Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>{formatIndicator(plan.fat_g_per_kg, 2)}</Text>
        </View>
        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.tableCell, { width: "40%" }]}>Carbohidratos</Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>{formatIndicator(plan.carbs_g, 1, " g")}</Text>
          <Text style={[styles.tableCell, { width: "30%" }]}>{formatIndicator(plan.carbs_g_per_kg, 2)}</Text>
        </View>
      </View>

      <View style={sharedStyles.section} wrap={false}>
        <Text style={sharedStyles.h2}>Porciones por grupo de alimento y comida</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { width: "40%" }]}>Grupo de alimento</Text>
          {catalogs.mealTypes.map((mealType) => (
            <Text key={mealType.id} style={[styles.tableHeaderCell, { width: `${mealColWidth}%` }]}>
              {mealType.name}
            </Text>
          ))}
          <Text style={[styles.tableHeaderCell, { width: "10%" }]}>Total</Text>
        </View>
        {catalogs.foodGroups.map((foodGroup, index) => (
          <View
            key={foodGroup.id}
            style={[
              styles.tableRow,
              index === catalogs.foodGroups.length - 1 ? { borderBottomWidth: 0 } : undefined,
            ]}
          >
            <Text style={[styles.tableCell, { width: "40%" }]}>{foodGroup.name}</Text>
            {catalogs.mealTypes.map((mealType) => (
              <Text key={mealType.id} style={[styles.tableCell, { width: `${mealColWidth}%` }]}>
                {plan.portions[`${foodGroup.id}:${mealType.id}`] ?? 0}
              </Text>
            ))}
            <Text style={[styles.tableCell, { width: "10%", fontFamily: "Helvetica-Bold" }]}>
              {rowTotal(foodGroup.id)}
            </Text>
          </View>
        ))}
      </View>

      <View style={sharedStyles.section} wrap={false}>
        <Text style={sharedStyles.h2}>Ejemplo de menú</Text>
        <View style={styles.menuGrid}>
          {catalogs.mealTypes.map((mealType) => (
            <View key={mealType.id} style={styles.menuBox}>
              <Text style={styles.menuBoxLabel}>{mealType.name}</Text>
              <Text style={styles.menuBoxValue}>{plan.menuExamples[mealType.id] || "Sin ejemplo registrado."}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={sharedStyles.section} wrap={false}>
        <Text style={sharedStyles.h2}>Recomendaciones generales</Text>
        <Text style={styles.paragraph}>{plan.general_recommendations || "Sin recomendaciones registradas."}</Text>
      </View>
    </>
  );
}
