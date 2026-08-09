import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./fixtures/auth";
import { ensureTestPlayerWithoutAssessments } from "./fixtures/test-player";

/**
 * Corre solo con --project=mobile (viewport 375×812, ver playwright.config.ts)
 * -- captura las pantallas clave del responsive mobile (login, dashboard,
 * jugadores, perfil, formulario de valoración) y confirma de paso que la
 * navegación inferior reemplaza al sidebar, no al revés. Screenshots van a
 * e2e/screenshots/ (gitignored) vía `page.screenshot()` explícito en cada
 * test -- no a playwright-report/, que el reporter HTML limpia al final de
 * cada corrida y se hubiera llevado las capturas puestas ahí.
 *
 *   npx playwright test --config=e2e/playwright.config.ts --project=mobile mobile-screens
 */
test.describe("Responsive mobile", () => {
  test("login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/mobile-login.png", fullPage: true });
  });

  test("dashboard: bottom nav visible, sidebar oculto", async ({ page }) => {
    await loginAsTestUser(page);

    await expect(page.locator("aside")).toBeHidden();
    const bottomNav = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Dashboard" })).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/mobile-dashboard.png", fullPage: true });
  });

  test("jugadores: filtros y tabla en formato card", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/jugadores");

    // La tabla tradicional (<table>) debe quedar oculta -- las filas se
    // muestran como cards apiladas (MobileCardList) en su lugar.
    await expect(page.locator("table").first()).toBeHidden();

    await page.screenshot({ path: "e2e/screenshots/mobile-jugadores.png", fullPage: true });
  });

  test("perfil de jugador: formulario de valoración en Sheet", async ({ page }) => {
    await loginAsTestUser(page);
    const playerId = await ensureTestPlayerWithoutAssessments(page);
    await page.goto(`/jugadores/${playerId}`);

    await page.screenshot({ path: "e2e/screenshots/mobile-perfil.png", fullPage: true });

    await page.getByRole("button", { name: "Nueva valoración" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();

    // Pantalla completa: el Sheet no debe dejar el margen/flotado de
    // escritorio en mobile (ver P2).
    const box = await sheet.boundingBox();
    const viewport = page.viewportSize();
    expect(box?.x).toBe(0);
    expect(box?.width).toBe(viewport?.width);

    await page.screenshot({ path: "e2e/screenshots/mobile-valoracion-form.png", fullPage: true });
  });
});
