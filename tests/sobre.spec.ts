import { test, expect } from "@playwright/test";

test.describe("Página Sobre Nós (Manifesto Cívico)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sobre");
  });

  test("renderiza todas as seções obrigatórias", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sobre Nós" })).toBeVisible();
    await expect(page.getByText(/Apenas Fatos, Zero Opinião/i)).toBeVisible();
    await expect(page.getByText(/Por que não temos campo de comentários/i)).toBeVisible();
    await expect(page.getByText(/Dados não são ringue de disputa/i)).toBeVisible();
    await expect(page.getByText(/Foco no discernimento pessoal/i)).toBeVisible();
    await expect(page.getByText(/O Nosso Único Pedido/i)).toBeVisible();
    await expect(page.getByText(/Analise as propostas/i)).toBeVisible();
    await expect(page.getByText(/Analise os votos/i)).toBeVisible();
    await expect(page.getByText(/Exercite o seu senso crítico/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Compromissos de Transparência/i }),
    ).toBeVisible();
    await expect(page.getByText(/Fonte oficial e auditável/i)).toBeVisible();
    await expect(page.getByText(/Independência financeira/i)).toBeVisible();
    await expect(page.getByText(/Código e regras abertas/i)).toBeVisible();
    await expect(page.getByText(/Patriota de verdade não idolatra/i)).toBeVisible();
  });

  test("botões de voltar apontam para a fiscalização", async ({ page }) => {
    const voltar = page.getByRole("link", { name: /Voltar para a fiscalização/i });
    await expect(voltar).toHaveCount(2); // topo e base
    await expect(voltar.first()).toHaveAttribute("href", "/");
  });

  test("link para o portal oficial da Câmara", async ({ page }) => {
    const link = page.locator('a[href="https://www.camara.leg.br"]');
    await expect(link.first()).toBeVisible();
    await expect(link.first()).toHaveAttribute("target", "_blank");
  });

  test("navegação home → sobre → home", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Sobre o Projeto" }).click();
    await expect(page).toHaveURL(/\/sobre$/);
    await page.getByRole("link", { name: /Voltar para a fiscalização/i }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: /mexem no seu bolso/i })).toBeVisible();
  });

  test("navegação pelo link do rodapé", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Manifesto Cívico/i }).click();
    await expect(page).toHaveURL(/\/sobre$/);
  });
});
