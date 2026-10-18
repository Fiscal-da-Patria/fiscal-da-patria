import { test, expect } from "@playwright/test";
import { cards, esperarCards } from "./helpers";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.describe("Responsividade — Mobile (390x844)", () => {
  test("header usa o rótulo curto 'Sobre'", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sobre", exact: true })).toBeVisible();
    // no mobile, a versão longa não existe no nome acessível
    await expect(
      page.locator("header").getByRole("link", { name: "Sobre o projeto" }),
    ).toHaveCount(0);
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

  test("card compacto no mobile", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const altura = (await cards(page).first().boundingBox())?.height ?? 0;
    expect(altura).toBeLessThan(160);
  });

  test("detalhes da pauta recolhem no mobile", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const situacao = page.getByText(/Situação no Senado:/);
    await expect(situacao).toBeHidden();
    await page.getByRole("button", { name: /Ver detalhes da votação/i }).click();
    await expect(situacao).toBeVisible();
  });

  test("filtros vêm antes das abas de cargo no mobile", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const filtros = await page.getByLabel("Filtrar por estado").boundingBox();
    const abas = await page.locator('[data-cargo-tab="TODOS"]').boundingBox();
    expect(filtros?.y ?? 0).toBeLessThan(abas?.y ?? 0);
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

  test("primeiro card aparece em até 2,35 telas", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const y = (await cards(page).first().boundingBox())?.y ?? 0;
    expect(y).toBeLessThan(844 * 2.35);
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
