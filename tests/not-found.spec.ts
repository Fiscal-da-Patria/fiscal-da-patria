import { test, expect } from "@playwright/test";

test.describe("Página 404", () => {
  test("rota inexistente mostra a 404 personalizada com caminhos de volta", async ({ page }) => {
    const resposta = await page.goto("/rota-que-nao-existe");

    expect(resposta?.status()).toBe(404);
    await expect(page.locator('[data-not-found="1"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: /Página não encontrada/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Voltar para a fiscalização/i })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(page.getByRole("link", { name: /Entenda os 3 Poderes/i }).first()).toHaveAttribute(
      "href",
      "/poderes",
    );
    await expect(page.getByRole("link", { name: /Sobre o projeto/i }).first()).toHaveAttribute(
      "href",
      "/sobre",
    );
  });
});
