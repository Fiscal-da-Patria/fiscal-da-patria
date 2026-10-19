import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { SITE_HOST } from "../src/lib/site";
import { esperarCards } from "./helpers";

test.describe("Compartilhar o top 5 de bancadas", () => {
  test("o gráfico tem o botão do top 5 e mantém o share individual por bancada", async ({
    page,
  }) => {
    await page.goto("/");
    await esperarCards(page);

    const grafico = page.getByTestId("grafico-partidos");
    const botao = grafico.locator("[data-compartilhar-top5]");
    await expect(botao).toHaveCount(1);
    await expect(botao).toHaveAttribute("aria-label", /5 maiores bancadas/i);

    // O cartão individual de cada partido continua disponível (as 5 visíveis).
    await expect(grafico.locator("[data-compartilhar-partido]")).toHaveCount(5);
    await expect(grafico.locator('[data-compartilhar-partido="PL"]')).toBeVisible();
  });

  test("a prévia mostra as 5 maiores bancadas com a manchete factual", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.locator("[data-compartilhar-top5]").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /Compartilhar o top 5/i })).toBeVisible();

    const cartao = dialog.locator("[data-share-card-top5]");
    await expect(cartao).toContainText("PEC 45/2019");
    await expect(cartao).toContainText(/Comida sem imposto/i);
    await expect(cartao).toContainText(/Top 5 bancadas/i);
    // O recorte é sempre declarado (nunca números que não batem com a tela).
    await expect(cartao).toContainText(/Recorte: Congresso Nacional/i);

    const linhas = cartao.locator("li");
    await expect(linhas).toHaveCount(5);
    // A 1ª bancada é a maior (desempate: quem mais votou contra).
    await expect(linhas.first()).toContainText("PL");
    await expect(linhas.first()).toContainText(/\d+ de \d+/);
    await expect(linhas.first()).toContainText(/Apoiou|Rejeitou|Abstenção|Ausente|Empate/);

    await expect(cartao).toContainText(/camara\.leg\.br/);
    await expect(cartao).toContainText(SITE_HOST);

    // Nenhuma bancada pode ficar cortada na imagem final (300×375 base).
    const caixa = await cartao.evaluate((el) => ({
      scrollH: el.scrollHeight,
      clientH: el.clientHeight,
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
    }));
    expect(caixa.scrollH).toBeLessThanOrEqual(caixa.clientH + 1);
    expect(caixa.scrollW).toBeLessThanOrEqual(caixa.clientW + 1);
  });

  test("baixa um PNG válido do top 5", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.locator("[data-compartilhar-top5]").click();

    const downloadPromise = page.waitForEvent("download", { timeout: 45_000 });
    await page.getByRole("dialog").locator('[data-baixar-imagem="1"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(
      /^Fiscal_da_Patria_Top5_Bancadas_PEC-45-2019\.png$/,
    );
    const caminho = await download.path();
    expect(caminho).toBeTruthy();

    const buf = fs.readFileSync(caminho as string);
    expect([buf[0], buf[1], buf[2], buf[3]]).toEqual([0x89, 0x50, 0x4e, 0x47]); // PNG
    expect(buf.length).toBeGreaterThan(3000);
  });

  test("copiar link leva o texto do top 5 + a pauta", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3000",
    });
    await page.goto("/");
    await esperarCards(page);
    await page.locator("[data-compartilhar-top5]").click();

    const dialog = page.getByRole("dialog");
    await dialog.locator('[data-copiar-link="1"]').click();
    await expect(dialog.getByRole("button", { name: /Copiado! ✓/ })).toBeVisible();

    const texto = await page.evaluate(() => navigator.clipboard.readText());
    expect(texto).toMatch(/Top 5 maiores bancadas/);
    expect(texto).toMatch(/• PL: \d+ de \d+/);
    expect(texto).toMatch(/PEC 45\/2019/);
    expect(texto).toMatch(/Recorte: Congresso Nacional/);
    expect(texto).toMatch(/\?pauta=cesta_basica/);
  });

  test("o link compartilhado preserva cargo, UF e busca do cartão", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3000",
    });
    await page.goto("/");
    await esperarCards(page);

    await page.getByRole("button", { name: /Senadores \(81\)/ }).click();
    await page.getByLabel("Filtrar por estado").selectOption("SP");
    await page.getByPlaceholder(/Buscar por nome/i).fill("PL");
    await page.locator("[data-compartilhar-top5]").click();

    const dialog = page.getByRole("dialog");
    await dialog.locator('[data-copiar-link="1"]').click();
    const texto = await page.evaluate(() => navigator.clipboard.readText());

    expect(texto).toContain("?pauta=cesta_basica");
    expect(texto).toContain("cargo=SENADOR");
    expect(texto).toContain("uf=SP");
    expect(texto).toContain("busca=PL");
  });

  test("cabe na tela do celular, sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await esperarCards(page);
    await page.locator("[data-compartilhar-top5]").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(false);
  });

  test("cabe na tela de 320px sem cortar o conteúdo", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await esperarCards(page);
    await page.locator("[data-compartilhar-top5]").click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(false);

    const cartao = dialog.locator("[data-share-card]");
    const ajuste = await cartao.evaluate((el) => ({
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    }));
    expect(ajuste.scrollHeight).toBeLessThanOrEqual(ajuste.clientHeight + 1);
  });
});
