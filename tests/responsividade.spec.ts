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

  test("atalhos mobile levam para a lista e para os gráficos", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    const atalhos = page.locator('[data-atalhos="1"]');
    await expect(atalhos).toBeVisible();
    await expect(page.getByText("Manifesto cívico", { exact: true })).toBeVisible();

    await atalhos.getByRole("link", { name: /Gráficos por partido/ }).click();
    await expect(page).toHaveURL(/#graficos$/);
    await expect(page.locator("#graficos")).toBeInViewport({ ratio: 0.1 });
  });

  test("compartilhamento utilizável no mobile", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.locator("[data-compartilhar-card]").first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-share-card]")).toBeVisible();
    await expect(dialog.locator('[data-baixar-imagem="1"]')).toBeVisible();
    await expect(dialog.locator('[data-compartilhar="1"]')).toBeVisible();
  });

  test("página Sobre legível no mobile", async ({ page }) => {
    await page.goto("/sobre");
    await expect(page.getByRole("heading", { name: "Sobre Nós" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Voltar para a fiscalização/i }).first()).toBeVisible();
  });

  test("skip link é o primeiro foco e leva ao conteúdo", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#conteudo$/);
  });

  test("não há rolagem horizontal em 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await esperarCards(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
