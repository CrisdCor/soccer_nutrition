/**
 * Piezas compartidas por los dos Route Handlers de reporte
 * (app/api/reportes/pdf y app/api/reportes/docx): mismos parámetros, mismo
 * nombre de archivo de descarga. Ninguno de los dos duplica esto por su
 * cuenta.
 */

export const ROLE_TITLES: Record<string, string> = {
  nutricionista: "Nutricionista Deportiva",
  admin: "Administrador",
  lider: "Líder de Proceso",
};

// new RegExp(...) en vez de un literal /[̀-ͯ]/ -- el literal se guarda con
// el caracter combinante real embebido en el archivo fuente en este entorno
// de edición, ilegible en un diff; construirlo desde el escape \u evita eso.
const DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g");

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
