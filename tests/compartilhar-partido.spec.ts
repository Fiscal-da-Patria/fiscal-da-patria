import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { SITE_HOST } from "../src/lib/site";
import { esperarCards } from "./helpers";

test.describe("Compartilhar o cartão de uma bancada", () => {
  test("o gráfico tem botão por bancada (as 5 maiores por padrão)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    const grafico = page.getByTestId("grafico-partidos");
    await expect(grafico.locator("[data-compartilhar-partido]")).toHaveCount(5);
    await expect(grafico.locator('[data-compartilhar-partido="PL"]')).toBeVisible();
  });

  test("a prévia traz partido, matéria, contagem e o recorte declarado", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.locator('[data-compartilhar-partido="PL"]').first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const cartao = dialog.locator("[data-share-card]");

    await expect(cartao).toContainText("PL");
    await expect(cartao).toContainText("PEC 45/2019");
    await expect(cartao).toContainText(/Comida sem imposto/i);
    await expect(cartao).toContainText(/deputados|senadores|parlamentares/i);
    // O recorte é sempre declarado (nunca números que não batem com a tela).
    await expect(cartao).toContainText(/Recorte: Congresso Nacional/i);
    // Manchete factual: "X de N" + o rótulo do voto (ou empate).
    await expect(cartao).toContainText(/\d+ de \d+/);
    await expect(cartao).toContainText(/Apoiou|Rejeitou|Abstenção|Ausente|Empate/);
    await expect(cartao).toContainText(/camara\.leg\.br/);
    await expect(cartao).toContainText(SITE_HOST);
  });

  test("baixa um PNG válido da bancada", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.locator('[data-compartilhar-partido="PL"]').first().click();

    const downloadPromise = page.waitForEvent("download", { timeout: 45_000 });
    await page.getByRole("dialog").locator('[data-baixar-imagem="1"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Fiscal_da_Patria_PL_.+\.png$/);
    const caminho = await download.path();
    expect(caminho).toBeTruthy();

    const buf = fs.readFileSync(caminho as string);
    expect([buf[0], buf[1], buf[2], buf[3]]).toEqual([0x89, 0x50, 0x4e, 0x47]); // PNG
    expect(buf.length).toBeGreaterThan(3000);
  });

  test("copiar link leva o texto factual + a pauta filtrada pela sigla", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3000",
    });
    await page.goto("/");
    await esperarCards(page);
    await page.locator('[data-compartilhar-partido="PL"]').first().click();

    const dialog = page.getByRole("dialog");
    await dialog.locator('[data-copiar-link="1"]').click();
    await expect(dialog.getByRole("button", { name: /Copiado! ✓/ })).toBeVisible();

    const texto = await page.evaluate(() => navigator.clipboard.readText());
    expect(texto).toMatch(/PL na votação de PEC 45\/2019:/);
    expect(texto).toMatch(/PEC 45\/2019/);
    expect(texto).toMatch(/Recorte: Congresso Nacional/);
    expect(texto).toMatch(/\?pauta=cesta_basica&busca=PL/);
  });

  test("cabe na tela do celular, sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await esperarCards(page);
    await page.locator('[data-compartilhar-partido="PL"]').first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(false);
  });

  test("bancada sem votação nominal mostra a mensagem honesta", async ({ page }) => {
    // Matéria auditada no Senado: a Câmara não tem voto individual.
    await page.goto("/?pauta=crime_organizado");
    await esperarCards(page);
    await page.getByRole("button", { name: /Deputados Federais \(513\)/ }).click();

    // Sem votos, a lista fica vazia — o gráfico mostra o estado vazio e não há cartão.
    await expect(page.getByText(/Nenhum voto individual nesta casa/i)).toBeVisible();
    await expect(page.locator("[data-compartilhar-partido]")).toHaveCount(0);
  });
});
