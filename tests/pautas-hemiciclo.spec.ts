import { test, expect } from "@playwright/test";
import { PAUTAS, esperarCards } from "./helpers";

test.describe("Pautas e hemiciclo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
  });

  test("alternar entre as 11 pautas mantém só uma ativa", async ({ page }) => {
    for (const rotulo of PAUTAS) {
      const pill = page.getByRole("button", { name: rotulo });
      await pill.click();
      await expect(pill).toHaveAttribute("aria-pressed", "true");
      await expect(
        page.locator('[data-pautas-pills] button[aria-pressed="true"]'),
      ).toHaveCount(1);
    }
  });

  test("card da pauta mostra rótulo, ementa e link oficial", async ({ page }) => {
    const card = page.locator('[data-pauta-card="1"]');
    await expect(card.getByText("Pauta selecionada")).toBeVisible();

    const link = card.getByRole("link", { name: /fonte oficial/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      /camara\.leg\.br\/proposicoesWeb\/fichadetramitacao\?idProposicao=\d+/,
    );
  });

  test("trocar de pauta troca a matéria exibida", async ({ page }) => {
    await expect(page.getByText("PEC 45/2019")).toBeVisible();
    await page.getByRole("button", { name: /Fim da blindagem de políticos/i }).click();
    await expect(page.getByText(/PEC 3\/2021/)).toBeVisible();
  });

  test("hemiciclo atualiza as contagens ao trocar de pauta", async ({ page }) => {
    // A legenda usa o rótulo FACTUAL de cada pauta (conformidade editorial):
    // "Apoiou isenção: 300" na Cesta Básica, "Apoiou piso: N" no piso da enfermagem.
    await expect(page.getByText(/Apoiou isenção:/).first()).toBeVisible();

    await page.getByRole("button", { name: /Piso salarial da enfermagem/i }).click();

    const legendaPiso = page.getByText(/Apoiou piso:/).first();
    await expect(legendaPiso).toBeVisible();
    const texto = await legendaPiso.evaluate((no) => no.parentElement?.textContent ?? "");
    expect(texto).toMatch(/Apoiou piso:\s*\d+/);
  });
});
