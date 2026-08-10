import { Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { COLORS } from "@/lib/pdf/styles";
import type { ReportDocumentData } from "@/lib/pdf/types";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    color: COLORS.foreground,
  },
  stripeTop: {
    height: 14,
    flexDirection: "row",
  },
  stripeBottom: {
    height: 14,
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  stripeRed: { flex: 1, backgroundColor: COLORS.red },
  stripeBlue: { flex: 1, backgroundColor: COLORS.blue },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  shield: {
    width: 120,
    height: 120,
    marginBottom: 28,
    objectFit: "contain",
  },
  title: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLORS.blue,
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.red,
    letterSpacing: 3,
    marginTop: 6,
    textAlign: "center",
  },
  context: {
    marginTop: 22,
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "center",
  },
  generatedBy: {
    position: "absolute",
    bottom: 46,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  generatedByName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.foreground,
  },
  generatedByRole: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
  },
});

/**
 * Página 1: portada. Franjas rojo/azul arriba y abajo (referencia: el
 * informe de la nutricionista), escudo del equipo, título + subtítulo,
 * nombre y cargo de quien generó el reporte.
 */
export function CoverPage({ data }: { data: ReportDocumentData }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.stripeTop}>
        <View style={styles.stripeRed} />
        <View style={styles.stripeBlue} />
      </View>

      <View style={styles.body}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image acá es la de
            @react-pdf/renderer (documento PDF, no HTML): no acepta alt. */}
        {data.shieldDataUri && <Image src={data.shieldDataUri} style={styles.shield} />}
        <Text style={styles.title}>INFORME GENERAL</Text>
        <Text style={styles.subtitle}>FUERZAS BÁSICAS</Text>
        <Text style={styles.context}>
          {data.categoryName} · {data.valoracionLabel}
        </Text>
      </View>

      <View style={styles.generatedBy}>
        <Text style={styles.generatedByName}>{data.generatedByName}</Text>
        {data.generatedByRoleTitle ? (
          <Text style={styles.generatedByRole}>{data.generatedByRoleTitle}</Text>
        ) : null}
      </View>

      <View style={styles.stripeBottom}>
        <View style={styles.stripeBlue} />
        <View style={styles.stripeRed} />
      </View>
    </Page>
  );
}
