import type { Page } from "@playwright/test";

/**
 * Nunca contra producción con credenciales reales: E2E_TEST_EMAIL/PASSWORD
 * son de un usuario QA que el propio usuario crea desde /usuarios (mismo
 * flujo real de alta), guardadas solo en .env.local (gitignored). Este
 * helper corre contra baseURL (localhost:3000 por defecto, ver
 * playwright.config.ts) -- nunca se apunta a una URL de producción aquí.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Faltan E2E_TEST_EMAIL / E2E_TEST_PASSWORD en .env.local. Crea un usuario de prueba " +
        "desde /usuarios (rol nutricionista o admin) y agrega esas dos variables -- ver README, " +
        "sección 'Pruebas E2E'."
    );
  }

  await page.goto("/login");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/dashboard");
}
