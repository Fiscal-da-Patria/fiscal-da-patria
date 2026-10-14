import { test, expect } from "@playwright/test";
import {
  TOTAL_DEPUTADOS,
  TOTAL_PARLAMENTARES,
  TOTAL_SENADORES,
  cards,
  carregarTodos,
  esperarCards,
} from "./helpers";

test.describe("Congresso: cargo, abas e votos do Senado", () => {
  test("as abas mostram as contagens oficiais (594/513/81)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await expect(
      page.getByRole("button", { name: new RegExp(`Todos \\(${TOTAL_PARLAMENTARES}\\)`) }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: new RegExp(`Deputados Federais \\(${TOTAL_DEPUTADOS}\\)`) }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: new RegExp(`Senadores \\(${TOTAL_SENADORES}\\)`) }),
    ).toBeVisible();
  });

  test("aba Senadores filtra para 81 e usa a tag âmbar do cargo", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\)/ }).click();
    await carregarTodos(page);

    await expect
      .poll(async () => await cards(page).count(), { timeout: 15_000 })
      .toBe(TOTAL_SENADORES);
    await expect(page.locator('[data-cargo="SENADOR"]').first()).toBeVisible();
    await expect(page.locator('[data-cargo="DEPUTADO"]')).toHaveCount(0);
  });

  test("aba Deputados Federais filtra para 513", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Deputados Federais \(513\)/ }).click();
    await carregarTodos(page);

    await expect
      .poll(async () => await cards(page).count(), { timeout: 15_000 })
      .toBe(TOTAL_DEPUTADOS);
    await expect(page.locator('[data-cargo="DEPUTADO"]').first()).toBeVisible();
    await expect(page.locator('[data-cargo="SENADOR"]')).toHaveCount(0);
  });

  test("busca unificada encontra senador pelo nome", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByPlaceholder(/Buscar por nome/i).fill("Flávio Bolsonaro");

    await expect(page.locator('[data-nome]').first()).toContainText("Flávio Bolsonaro");
    await expect.poll(async () => await cards(page).count(), { timeout: 8_000 }).toBeLessThan(5);
  });

  test("ordenação 'mais votados na eleição' existe e reordena", async ({ page, request }) => {
    const dados = (await (await request.get("/data/parlamentares.json")).json()) as Array<{
      nome: string;
      votosEleicao: number;
    }>;
    const campeao = [...dados].sort((a, b) => b.votosEleicao - a.votosEleicao)[0].nome;

    await page.goto("/");
    await esperarCards(page);
    await page.getByLabel("Ordenar a lista").selectOption("maisVotados");
    await expect(page.getByText(/Mostrando os mais votados na eleição/i)).toBeVisible();

    const nomes = await page
      .locator("[data-nome]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-nome")));
    expect(nomes[0]).toBe(campeao);
  });

  test("dossiê de senador: casa de origem, perfil oficial e situação no Senado", async ({
    page,
  }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\)/ }).click();
    await cards(page).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Senador da República/).first()).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Perfil oficial no Senado/i })).toHaveAttribute(
      "href",
      /senado\.leg\.br/,
    );
    // Transparência: a ficha explica a votação simbólica do Senado.
    await expect(dialog.getByText(/simbólica/i).first()).toBeVisible();
  });

  test("pauta auditada no Senado: a Câmara mostra o aviso em vez de 513 cards sem voto", async ({
    page,
  }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Lei mais dura contra o crime organizado/i }).click();

    await expect(page.getByText(/Situação no Senado/i)).toBeVisible();
    await page.getByRole("button", { name: /Deputados Federais \(513\)/ }).click();

    // Decisão de produto: sem votos da casa, o app explica — não despeja cards vazios.
    await expect(page.locator('[data-lista-vazia-casa="1"]')).toContainText(
      /auditada no Senado Federal/i,
    );
    await expect(page.locator("[data-nome]")).toHaveCount(0);
  });

  test("deep link ?cargo=SENADOR abre já filtrado", async ({ page }) => {
    await page.goto("/?cargo=SENADOR");
    await expect(page.getByRole("button", { name: /Senadores \(81\)/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await carregarTodos(page);
    await expect
      .poll(async () => await cards(page).count(), { timeout: 15_000 })
      .toBe(TOTAL_SENADORES);
  });
});
