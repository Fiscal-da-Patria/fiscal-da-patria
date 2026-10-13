import { test, expect } from "@playwright/test";
import { cards, esperarCards } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.describe("Responsividade — Mobile (390x844)", () => {
  test("header usa o rótulo curto 'Sobre'", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sobre", exact: true })).toBeVisible();
    // no mobile, a versão longa não existe no nome acessível
    await expect(page.getByRole("link", { name: "Sobre o Projeto" })).toHaveCount(0);
  });

  test("grade de deputados em coluna única", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const largura = await cards(page)
      .first()
      .evaluate(
        (el) => (el.closest("div.rounded-2xl") as HTMLElement).getBoundingClientRect().width,
      );
    expect(largura).toBeGreaterThan(300);
  });

  test("dossiê e carteirinha utilizáveis no mobile", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await cards(page).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Exportar cartão \(PNG 9:16\)/i }),
    ).toBeVisible();
  });

  test("página Sobre legível no mobile", async ({ page }) => {
    await page.goto("/sobre");
    await expect(page.getByRole("heading", { name: "Sobre Nós" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Voltar para a fiscalização/i }).first()).toBeVisible();
  });
});
