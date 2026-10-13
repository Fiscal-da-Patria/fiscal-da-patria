import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects: [
    {
      name: "chrome",
      // Usa o Google Chrome instalado (dispensa baixar o navegador do Playwright).
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    // A primeira compilação do dev (Turbopack) com o dataset completo é lenta:
    // 4 min evitam falso "Timed out waiting for webServer" em máquina fria.
    timeout: 240_000,
  },
});
