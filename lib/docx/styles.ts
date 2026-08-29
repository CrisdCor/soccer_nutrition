// Fuente estándar de Office -- no requiere embeber ningún archivo (a
// diferencia de Helvetica en el PDF, que @react-pdf/renderer resuelve con
// sus propias fuentes internas). Se aplica explícitamente en cada TextRun
// (no solo como default del documento) para que quede consistente incluso
// en encabezados de tabla y títulos de sección.
export const FONT = "Calibri";

// Mismos tokens de color que lib/pdf/styles.ts (y que app/globals.css) --
// docx.js espera hex SIN '#'. Si cambia la marca, actualizar en los dos
// lugares (PDF y Word usan cada uno su propia copia porque cada librería
// tiene su propio formato de color).
export const COLORS = {
  red: "C8102E",
  redSoft: "FDEEEF",
  blue: "1D3557",
  blueSoft: "EAEEF3",
  border: "E2E2E2",
  muted: "6B7280",
  foreground: "111827",
  white: "FFFFFF",
};
