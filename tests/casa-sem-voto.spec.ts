import { test, expect } from "@playwright/test";
import { cards, esperarCards } from "./helpers";

test.describe("Pautas sem voto na casa filtrada (clareza do dado)", () => {
  test("6x1 + Senadores: aviso, contagem 0 nas abas e gráfico com estado vazio", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    // A contagem das abas é por MATÉRIA: só depois de trocar a pauta ela reflete 0 no Senado
    await page.getByRole("button", { name: /Fim da escala 6x1/ }).click();
    await expect(
      page.getByRole("button", { name: /Deputados Federais \(513\) · 513 votaram/ }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ })).toBeVisible();

    await page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ }).click();

    const aviso = page.locator('[data-aviso-casa="1"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText(/ainda não votou esta matéria/i);

    await expect(
      page.getByTestId("grafico-partidos").getByText(/Nenhum voto individual nesta casa/i),
    ).toBeVisible();
  });

  test("pauta do Senado + Deputados: aviso explica a casa auditada", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Lei mais dura contra o crime organizado/i }).click();
    await page.getByRole("button", { name: /Deputados Federais \(513\) · 0 votaram/ }).click();

    const aviso = page.locator('[data-aviso-casa="1"]');
    await expect(aviso).toContainText(/auditada no Senado/i);
    await expect(page.locator('[data-trocar-casa="1"]')).toContainText(/Trocar para Senadores/i);
  });

  test("Cesta Básica + Senadores: votação parcial (73 de 81)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\) · 73 votaram/ }).click();

    const aviso = page.locator('[data-aviso-casa="1"]');
    await expect(aviso).toContainText(/Votação parcial nesta casa \(73 de 81\)/i);
  });

  test("toggle 'ver só quem votou' remove os 'Sem voto individual'", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\) · 73 votaram/ }).click();
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(81);

    await page.locator('[data-so-votaram="1"]').click();
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(73);
    await expect(page.locator('[data-so-votaram="1"]')).toContainText(/Mostrando só quem votou/i);
    await expect(page.locator("[data-nome]").filter({ hasText: "Sem voto individual" })).toHaveCount(
      0,
    );
  });

  test("em pauta sem voto na casa, 'só quem votou' mostra o estado vazio e 'Limpar filtros' restaura", async ({
    page,
  }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Fim da escala 6x1/ }).click();
    await page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ }).click();
    await page.locator('[data-so-votaram="1"]').click();

    await expect(page.getByText(/Nenhum parlamentar encontrado/i)).toBeVisible();
    await page.getByRole("button", { name: /Limpar filtros/i }).click();

    await expect(page.getByRole("button", { name: /Todos \(594/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(594);
  });
});
