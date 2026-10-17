import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { abrirCompartilhar, esperarCards } from "./helpers";

test.describe("Compartilhar o voto (imagem 4:5)", () => {
  test("a prévia mostra nome, partido, matéria e voto", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirCompartilhar(page);

    const cartao = dialog.locator("[data-share-card]");
    await expect(cartao).toBeVisible();
    await expect(cartao).toContainText(/PEC 45\/2019/);
    await expect(cartao).toContainText(/Comida sem imposto/i);
    await expect(cartao).toContainText(/No dia a dia/i);
    await expect(cartao).toContainText(/Deputado Federal|Senador da República/i);
    await expect(cartao).toContainText(/camara\.leg\.br/);
    await expect(cartao).toContainText(/fiscaldapatria\.org\.br/);

    // Nome + partido vêm do card que abriu o modal.
    const nome = (await page.locator("[data-nome]").first().getAttribute("data-nome")) ?? "";
    await expect(cartao).toContainText(nome);
    expect(nome.length).toBeGreaterThan(3);
  });

  test("o veredito do cartão é factual (com o voto registrado)", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirCompartilhar(page);
    const cartao = dialog.locator("[data-share-card]");

    await expect(
      cartao.getByText(/(Apoiou|Rejeitou) (isenção|a lei|blindagem)|Abstenção|Ausente/).first(),
    ).toBeVisible();
    // Quem votou tem o registro bruto; quem não votou tem o motivo.
    await expect(cartao.getByText(/Voto registrado|São|simbólica|não votou/i).first()).toBeVisible();
  });

  test("baixa um PNG válido", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirCompartilhar(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 45_000 });
    await dialog.locator('[data-baixar-imagem="1"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Fiscal_da_Patria_.+\.png$/);
    const caminho = await download.path();
    expect(caminho).toBeTruthy();

    const buf = fs.readFileSync(caminho as string);
    expect([buf[0], buf[1], buf[2], buf[3]]).toEqual([0x89, 0x50, 0x4e, 0x47]); // PNG
    expect(buf.length).toBeGreaterThan(3000);
  });

  test("copiar link leva o texto factual + o deep link", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3000",
    });
    await page.goto("/");
    const dialog = await abrirCompartilhar(page);

    await dialog.locator('[data-copiar-link="1"]').click();
    await expect(dialog.getByRole("button", { name: /Copiado! ✓/ })).toBeVisible();

    const texto = await page.evaluate(() => navigator.clipboard.readText());
    expect(texto).toMatch(/Nesta votação, .+ \((.+)\)/);
    expect(texto).toMatch(/\?deputado=(camara|senado)-\d+&pauta=/);
  });

  test("fecha com ESC, botão X e clique fora", async ({ page }) => {
    await page.goto("/");

    let dialog = await abrirCompartilhar(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    dialog = await abrirCompartilhar(page);
    await dialog.getByRole("button", { name: "Fechar" }).click();
    await expect(dialog).toBeHidden();

    dialog = await abrirCompartilhar(page);
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
  });

  test("cada card carrega o link da fonte oficial (regra do projeto)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    const fonte = page.locator("[data-fonte-card]").first();
    await expect(fonte).toBeVisible();
    await expect(fonte).toHaveAttribute(
      "href",
      /camara\.leg\.br\/proposicoesWeb\/fichadetramitacao\?idProposicao=\d+/,
    );
  });

  test("cabe na tela do celular, sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const dialog = await abrirCompartilhar(page);

    // Nada transborda para o lado (o cartão tinha 360px + paddings antes do ajuste).
    expect(await dialog.evaluate((el) => el.scrollWidth > el.clientWidth + 1)).toBe(false);

    const cartao = await dialog.locator("[data-share-card]").boundingBox();
    expect((cartao?.x ?? 0) + (cartao?.width ?? 0)).toBeLessThanOrEqual(360);
  });

  test("deep link ?deputado= filtra pela pessoa e destaca o card", async ({ page }) => {
    await page.goto("/?deputado=74646");

    await expect(page.getByPlaceholder(/Buscar por nome/i)).toHaveValue(/Aécio Neves/i);
    const focado = page.locator('[data-focado="1"]');
    await expect(focado).toHaveCount(1);
    await expect(focado).toContainText("Aécio Neves");
  });
});
