import { test, expect } from "@playwright/test";
import { esperarCards } from "./helpers";

test.describe("Hemiciclo — assentos reais da casa", () => {
  test("Congresso, Câmara e Senado desenham 594, 513 e 81 assentos", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const svg = page.getByRole("img", { name: /Distribuição dos votos/i });
    await expect(svg.locator("circle")).toHaveCount(594);
    await expect(page.getByTestId("hemiciclo")).toHaveAttribute("data-assentos", "594");

    await page.getByRole("button", { name: /Senadores \(81\) · 70 votaram/ }).click();
    await expect(svg.locator("circle")).toHaveCount(81);
    await expect(page.getByTestId("hemiciclo")).toHaveAttribute("data-assentos", "81");

    await page.getByRole("button", { name: /Deputados Federais \(513\)/ }).click();
    await expect(svg.locator("circle")).toHaveCount(513);
  });

  test("não transforma 'sem voto individual' em ausente", async ({ page }) => {
    await page.goto("/?pauta=fim_blindagem");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ }).click();

    const card = page.getByTestId("hemiciclo");
    await expect(card).toHaveAttribute("data-assentos", "81");
    await expect(card.getByText(/Sem voto individual:/)).toContainText("81");
    await expect(card.getByText(/Ausente:/)).toContainText("0");
  });

  test("toggle 'só quem votou' não altera o hemiciclo", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\) · 70 votaram/ }).click();

    const card = page.getByTestId("hemiciclo");
    await expect(card).toHaveAttribute("data-assentos", "81");

    const ausente = card.getByText(/Ausente:/);
    const naoAplicavel = card.getByText(/Sem voto individual:/);
    const antes = await ausente.textContent();
    const antesNaoAplicavel = await naoAplicavel.textContent();

    await page.locator('[data-so-votaram="1"]').click();
    await expect(card).toHaveAttribute("data-assentos", "81");
    await expect(ausente).toHaveText(antes ?? "");
    await expect(naoAplicavel).toHaveText(antesNaoAplicavel ?? "");
  });
});
