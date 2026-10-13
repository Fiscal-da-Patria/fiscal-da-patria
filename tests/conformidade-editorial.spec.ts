import { test, expect } from "@playwright/test";
import { cards, esperarCards } from "./helpers";

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

  test("nenhum termo proibido no dossiê aberto", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await cards(page).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const texto = await dialog.innerText();
    for (const termo of PROIBIDOS) {
      expect(texto, `termo proibido no dossiê (${termo})`).not.toMatch(termo);
    }
  });

  test("tags factuais com a cor certa: verde = apoio, vermelho = divergente", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

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

  test("as mensagens de compartilhamento também são factuais", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Fim da escala 6x1/i }).click();
    await cards(page).first().click();

    const href = (await page
      .getByRole("dialog")
      .getByRole("link", { name: /Enviar esta votação/i })
      .first()
      .getAttribute("href")) as string;
    const texto = new URL(href).searchParams.get("text") ?? "";

    for (const termo of PROIBIDOS) expect(texto).not.toMatch(termo);
    expect(texto).toMatch(/Apoiou |Rejeitou |se absteve|não tem voto/);
  });
});
