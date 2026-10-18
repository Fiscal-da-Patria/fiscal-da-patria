import { test, expect } from "@playwright/test";
import { cards, carregarTodos, esperarCards } from "./helpers";

test.describe("Pautas sem voto na casa filtrada (clareza do dado)", () => {
  test("blindagem + Senadores: aviso, contagem 0 nas abas e gráfico com estado vazio", async ({
    page,
  }) => {
    await page.goto("/");
    await esperarCards(page);

    // A contagem das abas é por MATÉRIA: só depois de trocar a pauta ela reflete 0 no Senado
    await page.getByRole("button", { name: /Fim da blindagem de políticos/i }).click();
    await expect(
      page.getByRole("button", { name: /Deputados Federais \(513\) · 450 votaram/ }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ })).toBeVisible();

    await page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ }).click();

    const aviso = page.locator('[data-aviso-casa="1"]');
    await expect(aviso).toBeVisible();
    await expect(aviso).toContainText(/arquivada no Senado/i);

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

  test("Cesta Básica + Senadores: votação parcial (70 de 81)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\) · 70 votaram/ }).click();

    const aviso = page.locator('[data-aviso-casa="1"]');
    await expect(aviso).toContainText(/Votação parcial nesta casa \(70 de 81\)/i);
  });

  test("toggle 'ver só quem votou' remove os 'Sem voto individual'", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\) · 70 votaram/ }).click();
    await carregarTodos(page);
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(81);

    await page.locator('[data-so-votaram="1"]').click();
    await carregarTodos(page);
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(70);
    await expect(page.locator('[data-so-votaram="1"]')).toContainText(/Mostrando só quem votou/i);
    await expect(page.locator("[data-nome]").filter({ hasText: "Sem voto individual" })).toHaveCount(
      0,
    );
  });

  test("casa sem voto: lista vazia com o motivo real (sem botão de reexibir)", async ({
    page,
  }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Fim da blindagem de políticos/i }).click();
    await page.getByRole("button", { name: /Senadores \(81\) · 0 votaram/ }).click();

    // Sem votos na casa, o app explica o motivo — e não lista 81 "Sem voto individual".
    const vazio = page.locator('[data-lista-vazia-casa="1"]');
    await expect(vazio).toBeVisible();
    await expect(vazio).toContainText(/arquivada/i);
    await expect(page.locator("[data-nome]")).toHaveCount(0);
    await expect(page.locator('[data-carregar-mais="1"]')).toHaveCount(0);
    // Decisão de produto: não existe mais atalho para reexibir a casa vazia.
    await expect(page.locator('[data-ver-sem-voto="1"]')).toHaveCount(0);
    await expect(page.locator('[data-so-votaram="1"]')).toHaveCount(0);

    // O caminho é a outra casa: na Câmara, esta pauta tem votação (450 votaram).
    await page.getByRole("button", { name: /Deputados Federais \(513\) · 450 votaram/ }).click();
    await carregarTodos(page);
    await expect.poll(async () => await cards(page).count(), { timeout: 15_000 }).toBe(513);
  });
});
