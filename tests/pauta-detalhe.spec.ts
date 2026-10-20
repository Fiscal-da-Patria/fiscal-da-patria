import { test, expect } from "@playwright/test";
import { cards, esperarCards } from "./helpers";

/** Detalhamento das pautas já concluídas (leis, emendas e o caso arquivado). */
test.describe("Pauta — o que foi aprovado", () => {
  test("lei sancionada: igualdade salarial mostra a Lei 14.611/2023", async ({ page }) => {
    await page.goto("/?pauta=igualdade_salarial");
    await esperarCards(page);

    await expect(page.locator('[data-norma-vigente="1"]')).toContainText("Lei 14.611/2023");
    await page.locator('[data-abrir-detalhe="1"]').click();

    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg).toContainText(/Sancionada em 03\/07\/2023/i);
    await expect(dlg).toContainText("Lei 14.611/2023");
    await expect(dlg.locator('[data-placar-camara="1"]')).toContainText(/325 SIM \/ 36 NÃO/);
    await expect(dlg.locator('[data-ponto-explicativo="1"]')).toHaveCount(3);
    await expect(dlg).toContainText(/Multa de 10 vezes o salário devido/);
    await expect(dlg.locator('[data-link-norma="1"]')).toHaveAttribute(
      "href",
      /planalto\.gov\.br\/.*l14611/,
    );
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
  });

  test("bets: lei revogada pela MP 1.394/2026, sem juízo sobre o voto de 2023", async ({ page }) => {
    await page.goto("/?pauta=bets");
    await esperarCards(page);

    await expect(page.locator('[data-norma-vigente="1"]')).toContainText(
      /Revogada pela Medida Provisória 1.394\/2026/i,
    );
    await expect(page.locator('[data-abrir-detalhe="1"]')).toContainText(
      /Ver o que aconteceu com a lei/i,
    );
    await page.locator('[data-abrir-detalhe="1"]').click();

    const dlg = page.getByRole("dialog");
    await expect(dlg).toContainText(/Revogada por MP em 25\/09\/2026/i);
    await expect(dlg).toContainText(/292 SIM \/ 114 NÃO \/ 1 ABST/);
    await expect(dlg).toContainText(/Lei 14.790\/2023/);
    await expect(dlg).toContainText(/Situação atual:/i);
    await expect(dlg).toContainText(/Congresso ainda vai votar/i);
    await expect(dlg.locator('[data-ponto-explicativo="1"]')).toHaveCount(3);
    await expect(dlg.locator('[data-ressalva="1"]')).toContainText(/não de um destaque específico/i);
    await expect(dlg.locator('[data-link-norma="1"]')).toHaveAttribute(
      "href",
      /planalto\.gov\.br\/.*l14790/,
    );
    await expect(dlg.locator('[data-link-norma-revogadora="1"]')).toHaveAttribute(
      "href",
      /planalto\.gov\.br\/.*mpv1394/,
    );
    await expect(dlg.locator('[data-link-materia-revogadora="1"]')).toHaveAttribute(
      "href",
      /camara\.leg\.br\/.*2647155/,
    );

    // O Senado votou simbolicamente: o aviso não pode dizer que ele "ainda não votou".
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ }).click();
    const aviso = page.locator('[data-aviso-casa="1"]');
    await expect(aviso).toContainText(/votação simbólica/i);
    await expect(aviso).not.toContainText(/ainda não votou/i);
  });

  test("emenda da cesta básica explica a EC 132/2023 e a LC 214/2025", async ({ page }) => {
    await page.goto("/?pauta=cesta_basica");
    await esperarCards(page);

    await expect(page.locator('[data-norma-vigente="1"]')).toContainText(
      "Emenda Constitucional 132/2023",
    );
    await page.locator('[data-abrir-detalhe="1"]').click();

    const dlg = page.getByRole("dialog");
    await expect(dlg).toContainText(/Promulgada em 20\/12\/2023/i);
    await expect(dlg).toContainText(/Lei Complementar 214\/2025/);
    await expect(dlg).toContainText(/cashback/i);
    await expect(dlg.locator('[data-placar-senado="1"]')).toContainText(/53 SIM \/ 24 NÃO/);
  });

  test("blindagem: arquivada na CCJ do Senado, sem 'voto no Senado'", async ({ page }) => {
    await page.goto("/?pauta=fim_blindagem");
    await esperarCards(page);

    await expect(page.locator('[data-norma-vigente="1"]')).toContainText(/Arquivada/i);
    await expect(page.locator('[data-abrir-detalhe="1"]')).toContainText(
      /Ver o que aconteceu com a proposta/i,
    );
    await page.locator('[data-abrir-detalhe="1"]').click();

    const dlg = page.getByRole("dialog");
    await expect(dlg).toContainText(/Arquivada em 25\/09\/2025/i);
    await expect(dlg).toContainText(/314 SIM \/ 168 NÃO/);
    await expect(dlg).toContainText(/Rejeitada pela CCJ em 24\/09\/2025/i);
    await expect(dlg.locator('[data-ponto-explicativo="1"]')).toHaveCount(3);
    await expect(dlg.locator('[data-link-norma="1"]')).toHaveCount(0);
    await expect(dlg.locator('[data-nota-placar="1"]')).toHaveCount(0);
    await expect(dlg.locator('[data-link-materia="1"]')).toHaveAttribute(
      "href",
      /senado\.leg\.br\/.*170519/,
    );

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ }).click();
    const aviso = page.locator('[data-aviso-casa="1"]');
    await expect(aviso).toContainText(/Esta proposta foi arquivada no Senado/i);
    await expect(cards(page)).toHaveCount(0);
  });

  test("botão 'Ver o que foi aprovado' tem affordance de ação", async ({ page }) => {
    await page.goto("/?pauta=cesta_basica");
    await esperarCards(page);

    const botao = page.locator('[data-abrir-detalhe="1"]');
    await expect(botao).toContainText(/Ver o que foi aprovado/i);
    await expect(botao).toHaveAttribute("aria-haspopup", "dialog");

    const caixa = await botao.boundingBox();
    expect(caixa?.height ?? 0).toBeGreaterThanOrEqual(44);
    await expect(botao).toHaveCSS("cursor", "pointer");
  });

  test("combustíveis: o texto não trata da conta de luz", async ({ page }) => {
    await page.goto("/?pauta=preco_energia");
    await esperarCards(page);

    await expect(page.locator('[data-norma-vigente="1"]')).toContainText(
      "Lei Complementar 235/2026",
    );
    await page.locator('[data-abrir-detalhe="1"]').click();

    const dlg = page.getByRole("dialog");
    await expect(dlg).toContainText(/Sancionada em 27\/08\/2026/i);
    await expect(dlg).toContainText(/Não é conta de luz/i);
    await expect(dlg.locator('[data-ressalva="1"]')).toContainText(/não mexe na tarifa de energia/i);
    await expect(dlg.locator('[data-placar-senado="1"]')).toContainText(/61 SIM \/ 2 NÃO/);
  });
});
