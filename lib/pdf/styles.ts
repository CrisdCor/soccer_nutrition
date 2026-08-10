import { StyleSheet } from "@react-pdf/renderer";

// Mismos tokens de color que app/globals.css (--brand-red / --brand-blue) --
// @react-pdf/renderer no puede leer variables CSS, así que se copian acá
// como constantes planas. Si cambia la marca, actualizar en ambos lugares.
export const COLORS = {
  red: "#c8102e",
  redSoft: "#fdeeef",
  blue: "#1d3557",
  blueSoft: "#eaeef3",
  border: "#e2e2e2",
  muted: "#6b7280",
  foreground: "#111827",
  surface: "#f9fafb",
};

export const sharedStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.foreground,
  },
  h1: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.foreground,
    marginBottom: 8,
  },
  h2: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.foreground,
    marginBottom: 6,
  },
  muted: {
    color: COLORS.muted,
  },
  section: {
    marginBottom: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
  },
});
