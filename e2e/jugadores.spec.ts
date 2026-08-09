import { expect, test } from "@playwright/test";
import { loginAsTestUser } from "./fixtures/auth";
import { ensureTestPlayerWithoutAssessments, TEST_PLAYER } from "./fixtures/test-player";

/**
 * Corre contra localhost:3000 (ver playwright.config.ts), nunca producción.
 * Usa un usuario QA (E2E_TEST_EMAIL/PASSWORD en .env.local, creado por el
 * usuario desde /usuarios) y un jugador de prueba idempotente (creado por
 * estos tests la primera vez, reutilizado después) -- ver e2e/fixtures/.
 */
test.describe("Perfil de jugador", () => {
  let playerId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    playerId = await ensureTestPlayerWithoutAssessments(page);
    await page.goto(`/jugadores/${playerId}`);
  });

  test.describe("Foto: hover-to-edit", () => {
    test("el ícono de editar solo aparece al hacer hover", async ({ page }) => {
      const photoButton = page.getByRole("button", { name: /Subir foto|Cambiar foto/ });
      const overlay = photoButton.locator("span").first();

      await expect(overlay).toHaveCSS("opacity", "0");
      await photoButton.hover();
      await expect(overlay).toHaveCSS("opacity", "1");
    });

    test("el clic dispara el input de archivo oculto", async ({ page }) => {
      const photoButton = page.getByRole("button", { name: /Subir foto|Cambiar foto/ });

      // Un input type=file (aunque esté oculto y el click venga de JS, no
      // del usuario) sigue abriendo el selector nativo -- Playwright lo
      // intercepta como evento "filechooser" en vez de abrir un diálogo de
      // verdad. No se llama a setFiles(): no hace falta subir nada real
      // para probar que el click llega al input.
      const fileChooserPromise = page.waitForEvent("filechooser");
      await photoButton.click();
      const fileChooser = await fileChooserPromise;

      expect(fileChooser.isMultiple()).toBe(false);
    });
  });

  test.describe('Menú "⋯"', () => {
    test("clic lo abre con exactamente Editar e Inactivar; clic fuera lo cierra", async ({ page }) => {
      await page.getByRole("button", { name: "Más acciones" }).click();

      const menu = page.getByRole("menu");
      await expect(menu).toBeVisible();
      await expect(menu.getByRole("menuitem")).toHaveText(["Editar", "Inactivar"]);

      // "Clic fuera": el nombre del jugador no es interactivo, sirve como
      // punto seguro fuera del menú sin arriesgar navegar a otra ruta.
      await page.getByRole("heading", { name: TEST_PLAYER.fullName }).click();
      await expect(menu).toBeHidden();
    });
  });

  test.describe("Modal de confirmación al inactivar", () => {
    test("Cancelar no cambia nada; Confirmar sí inactiva (y se reactiva al final)", async ({ page }) => {
      await page.getByRole("button", { name: "Más acciones" }).click();
      await page.getByRole("menuitem", { name: "Inactivar" }).click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(TEST_PLAYER.fullName);

      await dialog.getByRole("button", { name: "Cancelar" }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText("Inactivo")).toHaveCount(0);

      // Ahora sí, confirmar de verdad.
      await page.getByRole("button", { name: "Más acciones" }).click();
      await page.getByRole("menuitem", { name: "Inactivar" }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Inactivar" }).click();
      await expect(page.getByText("Inactivo")).toBeVisible();

      // Dejar el fixture activo para no afectar corridas futuras.
      await page.getByRole("button", { name: "Más acciones" }).click();
      await page.getByRole("menuitem", { name: "Activar" }).click();
      await expect(page.getByText("Inactivo")).toHaveCount(0);
    });
  });

  test.describe("Encabezado del perfil", () => {
    test("subtítulo Categoría · Cantera, y Dato insuficiente sin valoraciones", async ({ page }) => {
      // El fixture siempre se crea con categoría + cantera=true.
      await expect(page.getByText(/·\s*Cantera$/)).toBeVisible();

      // Peso, Talla, IMC, % Grasa, IAKS: 5 campos que dependen de la
      // valoración más reciente. Este jugador no tiene ninguna.
      await expect(page.getByText("Dato insuficiente")).toHaveCount(5);
    });
  });
});
