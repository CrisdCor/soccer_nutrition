import type { Page } from "@playwright/test";

/**
 * Jugador fijo, sin valoraciones, para el caso "Dato insuficiente" del
 * encabezado. Se crea vía el mismo formulario "Nuevo jugador" que usaría la
 * nutricionista real (no se escribe directo a la base) y queda con
 * categoría + cantera=true para también cubrir la aserción de subtítulo
 * "Categoría · Cantera" en el mismo fixture.
 */
export const TEST_PLAYER = {
  document: "E2E-TEST-0001",
  fullName: "Jugador E2E (no borrar)",
  birthDate: "2009-05-15",
};

/**
 * Idempotente: si el jugador ya existe (de una corrida anterior) lo
 * reutiliza en vez de crear un duplicado -- players nunca se borra
 * físicamente en esta app, así que crear uno nuevo cada corrida acumularía
 * basura de prueba en la base real.
 */
export async function ensureTestPlayerWithoutAssessments(page: Page): Promise<string> {
  await page.goto("/jugadores?status=all");
  const existingLink = page.getByRole("link", { name: TEST_PLAYER.fullName });

  if ((await existingLink.count()) > 0) {
    await existingLink.first().click();
    await page.waitForURL(/\/jugadores\/[0-9a-f-]+$/);
    return extractPlayerId(page.url());
  }

  await page.goto("/jugadores/nuevo");
  await page.getByLabel("Documento").fill(TEST_PLAYER.document);
  await page.getByLabel("Nombre completo").fill(TEST_PLAYER.fullName);
  await page.getByLabel("Fecha de nacimiento").fill(TEST_PLAYER.birthDate);
  await page.getByLabel("Sexo").selectOption("Hombre");

  // Raza es catálogo cerrado global (siempre sembrado); Categoría es propia
  // de la organización y podría estar vacía en un despliegue nuevo -- se
  // selecciona solo si hay al menos una opción real además del placeholder.
  await page.getByLabel("Raza").selectOption({ index: 1 });
  const categoryOptions = page.getByLabel("Categoría").locator("option");
  if ((await categoryOptions.count()) > 1) {
    await page.getByLabel("Categoría").selectOption({ index: 1 });
  }
  await page.getByLabel("Cantera (home club)").check();

  await page.getByRole("button", { name: "Crear jugador" }).click();
  await page.waitForURL(/\/jugadores\/[0-9a-f-]+$/);
  return extractPlayerId(page.url());
}

function extractPlayerId(url: string): string {
  const match = url.match(/\/jugadores\/([0-9a-f-]+)$/);
  if (!match) {
    throw new Error(`No se pudo extraer el id del jugador desde la URL: ${url}`);
  }
  return match[1];
}
