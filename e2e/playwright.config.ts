import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// El proceso de Playwright es independiente del de `next dev`: Next.js carga
// .env.local solo, pero este proceso no. Se carga a mano desde la raíz del
// repo (un nivel arriba de e2e/) para que E2E_TEST_EMAIL/PASSWORD lleguen a
// los tests igual que si fueran del propio Next.
dotenv.config({ path: path.resolve(__dirname, "../.env.local"), quiet: true });

export default defineConfig({
  testDir: ".",
  timeout: 30_000,
  // Los tests comparten datos reales contra Supabase (jugador de prueba
  // idempotente, usuario QA) -- correrlos en serie evita condiciones de
  // carrera entre specs, no hay entorno de test aislado por corrida.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  // Si ya tienes `npm run dev` corriendo, Playwright lo reutiliza
  // (reuseExistingServer) en vez de levantar un segundo proceso.
  webServer: {
    command: "npm run dev",
    cwd: path.resolve(__dirname, ".."),
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
