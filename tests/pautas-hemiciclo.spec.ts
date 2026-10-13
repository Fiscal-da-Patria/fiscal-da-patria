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
      await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);
    }
  });

  test("card da pauta mostra rótulo, ementa e link oficial", async ({ page }) => {
    const link = page.getByRole("link", { name: /fonte oficial/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      /camara\.leg\.br\/proposicoesWeb\/fichadetramitacao\?idProposicao=\d+/,
    );
    await expect(page.getByText("Pauta selecionada")).toBeVisible();
  });

  test("trocar de pauta troca a matéria exibida", async ({ page }) => {
    await expect(page.getByText("PEC 45/2019")).toBeVisible();
    await page.getByRole("button", { name: /Fim da blindagem de políticos/i }).click();
    await expect(page.getByText(/PEC 3\/2021/)).toBeVisible();
  });

  test("hemiciclo atualiza as contagens ao trocar de pauta", async ({ page }) => {
    const legendaFavoravel = () => page.getByText(/A favor do cidadão:/).innerText();
    const antes = await legendaFavoravel();
    await page.getByRole("button", { name: /Piso salarial da enfermagem/i }).click();
    await expect.poll(async () => await legendaFavoravel(), { timeout: 5_000 }).not.toBe(antes);
  });
});
