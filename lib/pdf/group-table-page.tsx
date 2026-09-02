import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { computeDisplayAge } from "@/lib/calculations";
import { classifyByThreshold, formatIndicator, formatPercentage, type ThresholdRange } from "@/lib/format";
import { COLORS, sharedStyles } from "@/lib/pdf/styles";
import type { ReportDocumentData, ReportPlayerData } from "@/lib/pdf/types";

const styles = StyleSheet.create({
  page: {
    ...sharedStyles.page,
    fontSize: 8,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: COLORS.blue,
    paddingVertical: 6,
  },
  headerCell: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 5,
    minHeight: 18,
    alignItems: "center",
  },
  rowAlt: {
    backgroundColor: COLORS.surface,
  },
  cell: {
    paddingHorizontal: 4,
  },
  cellOutOfRange: {
    backgroundColor: COLORS.redSoft,
    color: COLORS.red,
  },
  cellHigh: {
    backgroundColor: COLORS.redSoft,
    color: COLORS.red,
  },
  cellLow: {
    backgroundColor: COLORS.blueSoft,
    color: COLORS.blue,
  },
});

// Anchos relativos (suman 100) -- Nombre es la columna más ancha.
const COLUMN_WIDTHS = {
  position: 13,
  name: 22,
  age: 8,
  height: 10,
  weight: 10,
  musclePct: 13,
  skinfoldSum: 12,
  aks: 12,
};

/**
 * Página 2: reporte grupal de todos los jugadores de la categoría con la
 * valoración seleccionada. Suma 6 Pliegues usa 3 niveles (azul si
 * Óptima/bajo, rojo si Alta/alto, sin color si Aceptable/normal) -- Índice
 * AKS sin cambios, sigue siendo binario (rojo si fuera de rango, mismo
 * criterio que RangeBadge en el dashboard). % Masa Muscular queda sin color
 * -- no hay umbral definido todavía para esa métrica.
 */
export function GroupTablePage({ data }: { data: ReportDocumentData }) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={sharedStyles.h1}>Reporte grupal</Text>
      <Text style={[sharedStyles.muted, { marginBottom: 12 }]}>
        {data.categoryName} · {data.valoracionLabel} · {data.players.length} jugadores
      </Text>

      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.position}%` }]}>Posición</Text>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.name}%` }]}>Nombre</Text>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.age}%` }]}>Edad</Text>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.height}%` }]}>Talla</Text>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.weight}%` }]}>Peso</Text>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.musclePct}%` }]}>% M. Muscular</Text>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.skinfoldSum}%` }]}>Suma 6 Pliegues</Text>
        <Text style={[styles.headerCell, { width: `${COLUMN_WIDTHS.aks}%` }]}>Índice AKS</Text>
      </View>

      {data.players.map((row, index) => (
        <GroupTableRow key={row.player.id} row={row} alt={index % 2 === 1} thresholds={data.thresholds} />
      ))}
    </Page>
  );
}

function GroupTableRow({
  row,
  alt,
  thresholds,
}: {
  row: ReportPlayerData;
  alt: boolean;
  thresholds: ReportDocumentData["thresholds"];
}) {
  const { player, assessment } = row;
  const age = computeDisplayAge(new Date(player.birth_date), new Date(assessment.assessment_date));

  const skinfoldClassification = classifyByThreshold(assessment.skinfold_sum_6, thresholds.skinfold_sum);
  const skinfoldStyle =
    skinfoldClassification === "alto" ? styles.cellHigh : skinfoldClassification === "bajo" ? styles.cellLow : undefined;
  const aksOut = isOutOfRange(assessment.aks_index, thresholds.aks_index);

  return (
    <View style={[styles.row, alt ? styles.rowAlt : undefined]} wrap={false}>
      <Text style={[styles.cell, { width: `${COLUMN_WIDTHS.position}%` }]}>{player.position?.name ?? "—"}</Text>
      <Text style={[styles.cell, { width: `${COLUMN_WIDTHS.name}%` }]}>{player.full_name}</Text>
      <Text style={[styles.cell, { width: `${COLUMN_WIDTHS.age}%` }]}>{age}</Text>
      <Text style={[styles.cell, { width: `${COLUMN_WIDTHS.height}%` }]}>
        {formatIndicator(assessment.height_cm, 1, " cm")}
      </Text>
      <Text style={[styles.cell, { width: `${COLUMN_WIDTHS.weight}%` }]}>
        {formatIndicator(assessment.weight_kg, 1, " kg")}
      </Text>
      <Text style={[styles.cell, { width: `${COLUMN_WIDTHS.musclePct}%` }]}>
        {formatPercentage(assessment.muscle_percentage)}
      </Text>
      <Text
        style={[
          styles.cell,
          skinfoldStyle,
          { width: `${COLUMN_WIDTHS.skinfoldSum}%` },
        ]}
      >
        {formatIndicator(assessment.skinfold_sum_6, 1, " mm")}
      </Text>
      <Text
        style={[styles.cell, aksOut ? styles.cellOutOfRange : undefined, { width: `${COLUMN_WIDTHS.aks}%` }]}
      >
        {formatIndicator(assessment.aks_index, 2)}
      </Text>
    </View>
  );
}

function isOutOfRange(value: number | null, threshold: ThresholdRange | null): boolean {
  const classification = classifyByThreshold(value, threshold);
  return classification != null && classification !== "normal";
}
