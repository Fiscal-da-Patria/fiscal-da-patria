import { test, expect } from "@playwright/test";
import { TOTAL_PARLAMENTARES, cards, esperarCards } from "./helpers";

test.describe("Filtros de busca e UF", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
  });

  const buscar = (page: import("@playwright/test").Page) => page.getByPlaceholder(/Buscar por nome/i);

  test("busca por nome é insensível a acento", async ({ page }) => {
    await buscar(page).fill("aecio");
    await expect.poll(async () => await cards(page).count(), { timeout: 8_000 }).toBeLessThan(10);
    await expect(page.getByText(/Aécio Neves/i)).toBeVisible();
  });

  test("busca por partido reduz a lista", async ({ page }) => {
    await buscar(page).fill("PSDB");
    const n = await expect
      .poll(async () => await cards(page).count(), { timeout: 8_000 })
      .toBeLessThan(TOTAL_PARLAMENTARES);
    void n;
    await expect.poll(async () => await cards(page).count(), { timeout: 8_000 }).toBeGreaterThan(0);
  });

  test("resultado vazio mostra mensagem", async ({ page }) => {
    await buscar(page).fill("ZZZXQW");
    await expect(page.getByText(/Nenhum parlamentar encontrado/i)).toBeVisible({ timeout: 8_000 });
    await expect(cards(page)).toHaveCount(0);
  });

  test("estado vazio é acolhedor e o botão \"Limpar filtros\" restaura a lista", async ({ page }) => {
    await buscar(page).fill("ZZZXQW");
    await expect(
      page.getByText(/Nenhum parlamentar encontrado com esse nome/i),
    ).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/Confira a grafia/i)).toBeVisible();
    await expect(cards(page)).toHaveCount(0);

    await page.getByRole("button", { name: /Limpar filtros/i }).click();
    await expect(buscar(page)).toHaveValue("");
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(TOTAL_PARLAMENTARES);
  });

  test("estado vazio limpa também a UF e os parâmetros da URL", async ({ page }) => {
    await page.goto("/?busca=ZZZXQW&pauta=fim_blindagem");
    await expect(page.getByText(/Nenhum parlamentar encontrado/i)).toBeVisible({ timeout: 8_000 });

    await page.getByRole("button", { name: /Limpar filtros/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByLabel("Filtrar por estado")).toHaveValue("TODOS");
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(TOTAL_PARLAMENTARES);
  });

  test("limpar a busca restaura a lista", async ({ page }) => {
    await buscar(page).fill("Aécio");
    await expect.poll(async () => await cards(page).count(), { timeout: 8_000 }).toBeLessThan(10);
    await buscar(page).fill("");
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(TOTAL_PARLAMENTARES);
  });

  test("filtro por UF=SP exclui outras UFs", async ({ page }) => {
    await page.getByLabel("Filtrar por estado").selectOption("SP");
    await page.waitForTimeout(500);
    await expect.poll(async () => await cards(page).count(), { timeout: 8_000 }).toBeGreaterThan(30);
    await expect(page.locator("p", { hasText: /\u2022\s(?!SP)[A-Z]{2}$/ })).toHaveCount(0);
    await expect(page.getByText(/\u2022\sSP$/).first()).toBeVisible();
  });

  test("combinação busca + UF", async ({ page }) => {
    await page.getByLabel("Filtrar por estado").selectOption("MG");
    await buscar(page).fill("aecio");
    await expect.poll(async () => await cards(page).count(), { timeout: 8_000 }).toBe(1);
    await expect(page.getByText(/Aécio Neves/i)).toBeVisible();
  });
});
