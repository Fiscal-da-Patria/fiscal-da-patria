import { test, expect } from "@playwright/test";
import { carregarTodos, esperarCards } from "./helpers";
import { mensagemParlamentarNaPauta } from "../src/lib/share";

/** Termos PROIBIDOS na interface visível (conformidade editorial/jurídica). */
const PROIBIDOS = [/contra o cidadão/i, /a favor do cidadão/i, /pior voto/i, /melhor voto/i];

/** Verde (apoio) e vermelho (divergente) da paleta cívica. */
const VERDE = "rgb(27, 77, 62)"; // #1b4d3e
const VERMELHO = "rgb(185, 28, 28)"; // #b91c1c

const corDoRotulo = (el: HTMLElement) => getComputedStyle(el).backgroundColor;

test.describe("Conformidade editorial — rótulos factuais", () => {
  for (const rota of ["/", "/poderes", "/sobre"]) {
    test(`nenhum termo proibido em ${rota}`, async ({ page }) => {
      await page.goto(rota);
      if (rota === "/") await esperarCards(page);

      const html = await page.content();
      for (const termo of PROIBIDOS) {
        expect(html, `termo proibido (${termo}) em ${rota}`).not.toMatch(termo);
      }
    });
  }

  test("nenhum termo proibido nos cards e no compartilhamento", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    const cardTexto = await page.locator("[data-nome]").first().innerText();
    for (const termo of PROIBIDOS) {
      expect(cardTexto, `termo proibido no card (${termo})`).not.toMatch(termo);
    }

    await page.locator("[data-compartilhar-card]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const texto = await dialog.innerText();
    for (const termo of PROIBIDOS) {
      expect(texto, `termo proibido no compartilhamento (${termo})`).not.toMatch(termo);
    }
  });

  test("tags factuais com a cor certa: verde = apoio, vermelho = divergente", async ({ page }) => {
    await page.goto("/");
    await carregarTodos(page);

    const apoio = page.locator("[data-nome]").filter({ hasText: "Apoiou isenção" }).first();
    await expect(apoio).toBeVisible();
    await expect(
      apoio.getByText("Apoiou isenção").evaluate(corDoRotulo),
    ).resolves.toBe(VERDE);

    const divergente = page.locator("[data-nome]").filter({ hasText: "Rejeitou isenção" }).first();
    await expect(divergente).toBeVisible();
    await expect(
      divergente.getByText("Rejeitou isenção").evaluate(corDoRotulo),
    ).resolves.toBe(VERMELHO);
  });

  test("pauta invertida (Blindagem): verde é quem rejeitou a blindagem", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Fim da blindagem de políticos/i }).click();
    await carregarTodos(page);

    const rejeitou = page.locator("[data-nome]").filter({ hasText: "Rejeitou blindagem" }).first();
    const apoiou = page.locator("[data-nome]").filter({ hasText: "Apoiou blindagem" }).first();
    await expect(rejeitou).toBeVisible();
    await expect(apoiou).toBeVisible();

    await expect(rejeitou.getByText("Rejeitou blindagem").evaluate(corDoRotulo)).resolves.toBe(
      VERDE,
    );
    await expect(apoiou.getByText("Apoiou blindagem").evaluate(corDoRotulo)).resolves.toBe(
      VERMELHO,
    );

    // O banner cita o FATO da pauta (não "contrário à proposta", que se inverteria aqui).
    await expect(page.getByText(/Mostrando primeiro quem Apoiou blindagem/i)).toBeVisible();
  });

  test("as mensagens de compartilhamento também são factuais", async () => {
    // Unidade: é a mesma função que monta o texto do cartão no modal.
    const texto = mensagemParlamentarNaPauta(
      { id: "camara-1", nome: "Fulano", partido: "XX", uf: "RJ", cargo: "DEPUTADO" },
      { slug: "cesta_basica", rotuloPopular: "Comida sem imposto", materia: "PEC 45/2019" },
      { alinhamento: "CONTRA", bruto: "NAO" },
    );

    for (const termo of PROIBIDOS) expect(texto).not.toMatch(termo);
    expect(texto).toMatch(/Apoiou |Rejeitou |se absteve|não tem voto/);
    expect(texto).toMatch(/PEC 45\/2019/);
    expect(texto).toMatch(/\?deputado=camara-1&pauta=cesta_basica/);
  });
});
