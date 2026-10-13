import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { ROTULOS_CURTOS } from "../src/lib/pautas";
import { abrirPrimeiroDossie } from "./helpers";

test.describe("Dossiê do deputado", () => {
  test("abre com dados, link oficial e a matriz das 11 pautas", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);

    await expect(dialog.getByText(/Todas as 11 pautas/i)).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: /Perfil oficial (na Câmara|no Senado)/i }),
    ).toHaveAttribute("href", /(camara|senado)\.leg\.br/);

    // Layout compacto: linha principal com o nome popular CURTO + identificador oficial.
    for (const curto of Object.values(ROTULOS_CURTOS)) {
      await expect(dialog.getByText(curto, { exact: true }).first()).toBeVisible();
    }
    await expect(dialog.locator("[data-pauta-linha]")).toHaveCount(11);
    await expect(dialog.getByText(/PEC 45\/2019 \(Comida sem Imposto\)/)).toBeVisible();

    // Um link de fonte oficial por pauta (o bloco em destaque tem o seu próprio).
    const linksProp = dialog.locator("[data-fonte-pauta]");
    await expect(linksProp).toHaveCount(11);
    await expect(linksProp.first()).toHaveAttribute(
      "href",
      /proposicoesWeb\/fichadetramitacao\?idProposicao=\d+/,
    );
  });

  test("placar resumo e filtro rápido das votações", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);

    // Placar: participações + pílulas de contagem
    await expect(dialog.getByText(/Votou em \d+ de 11 pautas prioritárias/)).toBeVisible();
    await expect(dialog.getByText(/🟢 \d+ apoios/)).toBeVisible();
    await expect(dialog.getByText(/🔴 \d+ divergências/)).toBeVisible();
    await expect(dialog.getByText(/⚪ \d+ ausências\/abstenções/)).toBeVisible();

    // Filtro: só divergências → todas as linhas visíveis são 🔴 Rejeitou
    await dialog.locator('[data-filtro-dossie="divergencias"]').click();
    await expect(
      dialog.locator('[data-filtro-dossie="divergencias"]'),
    ).toHaveAttribute("aria-pressed", "true");

    const linhas = dialog.locator("[data-pauta-linha]");
    const total = await linhas.count();
    expect(total).toBeLessThanOrEqual(11);
    for (let i = 0; i < total; i++) {
      await expect(linhas.nth(i)).toContainText("🔴 Rejeitou");
    }

    // Apoios e Ausências também filtram
    await dialog.locator('[data-filtro-dossie="apoios"]').click();
    const apoioTotal = await linhas.count();
    for (let i = 0; i < apoioTotal; i++) {
      await expect(linhas.nth(i)).toContainText("🟢 Apoiou");
    }

    await dialog.locator('[data-filtro-dossie="todas"]').click();
    await expect(linhas).toHaveCount(11);
  });

  test("ícone de informação abre o detalhe da pauta (mobile-friendly)", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);

    const botao = dialog.getByRole("button", { name: /Detalhes de PEC 45\/2019/i }).first();
    await botao.click();
    await expect(botao).toHaveAttribute("aria-expanded", "true");
    await expect(
      dialog.locator('[data-pauta-linha="cesta_basica"]').getByText(/Sistema Tributário/i),
    ).toBeVisible();
  });

  test("fecha com ESC", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("fecha com o botão X", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);
    await dialog.getByRole("button", { name: "Fechar" }).click();
    await expect(dialog).toBeHidden();
  });

  test("fecha ao clicar no overlay", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
  });
});

test.describe("Carteirinha / Selo do Auditor Cívico", () => {
  test("o cartão da pauta vem ANTES do cartão geral", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);

    const botaoPauta = dialog.getByRole("button", {
      name: /Exportar cartão da pauta \(PNG 4:5\)/i,
    });
    const botaoGeral = dialog.getByRole("button", { name: /Exportar cartão \(PNG 9:16\)/i });
    await expect(botaoPauta).toBeVisible();
    await expect(botaoGeral).toBeVisible();

    const ordem = await dialog.evaluate((el) => {
      const botoes = Array.from(el.querySelectorAll("button"));
      const pauta = botoes.findIndex((b) => /cartão da pauta/i.test(b.textContent ?? ""));
      const geral = botoes.findIndex((b) => /Exportar cartão \(PNG 9:16\)/i.test(b.textContent ?? ""));
      return pauta >= 0 && geral >= 0 && pauta < geral;
    });
    expect(ordem).toBe(true);

    const yPauta = (await botaoPauta.boundingBox())?.y ?? 0;
    const yGeral = (await botaoGeral.boundingBox())?.y ?? 0;
    expect(yPauta).toBeLessThan(yGeral);
  });

  test("card contém selo, alinhamento e chamada", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);
    await expect(dialog.getByText(/Selo de Transparência Cívica/i)).toBeVisible();
    await expect(dialog.getByText("Alinhamento cívico", { exact: true })).toBeVisible();
    await expect(dialog.getByText(/Audite você também/i)).toBeVisible();
  });

  test("exporta um PNG 9:16 válido", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirPrimeiroDossie(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 45_000 });
    await dialog.getByRole("button", { name: /Exportar cartão \(PNG 9:16\)/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Fiscal_da_Patria_.+\.png$/);
    const caminho = await download.path();
    expect(caminho).toBeTruthy();

    const buf = fs.readFileSync(caminho as string);
    expect([buf[0], buf[1], buf[2], buf[3]]).toEqual([0x89, 0x50, 0x4e, 0x47]); // PNG
    expect(buf.length).toBeGreaterThan(3000);
  });
});
