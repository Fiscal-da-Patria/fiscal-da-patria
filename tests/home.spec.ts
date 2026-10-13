import { test, expect } from "@playwright/test";
import { numeroCompacto } from "../src/lib/parlamentares";
import { PAUTAS, TOTAL_PARLAMENTARES, esperarTodos } from "./helpers";

test.describe("Home — estrutura e dados", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("título da página e hero", async ({ page }) => {
    await expect(page).toHaveTitle(/Fiscal da Pátria/i);
    await expect(page.getByRole("heading", { name: /mexem no seu bolso/i })).toBeVisible();
    await expect(
      page.getByText(/nominais oficiais da Câmara e do Senado/i),
    ).toBeVisible();
  });

  test("header: marca, link 'Sobre o Projeto' e selo", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Fiscal da Pátria/i })).toBeVisible();
    const sobre = page.getByRole("link", { name: "Sobre o Projeto" });
    await expect(sobre).toBeVisible();
    await expect(sobre).toHaveAttribute("href", "/sobre");
    await expect(page.getByText("Dados oficiais")).toBeVisible();
  });

  test("carrega a base completa e mostra o contador", async ({ page }) => {
    await esperarTodos(page);
    await expect(
      page.getByText(new RegExp(`^${TOTAL_PARLAMENTARES} parlamentar\\(es\\)$`)),
    ).toBeVisible();
  });

  test("cards exibem foto, alinhamento cívico e mini-barras", async ({ page }) => {
    await esperarTodos(page);
    await expect(page.getByText("Alinhamento cívico").first()).toBeVisible();
    await expect(page.locator('img[src^="/fotos/"]').first()).toBeVisible();
  });

  test("hemiciclo com legenda completa", async ({ page }) => {
    await expect(page.getByRole("img", { name: /Distribuição dos votos/i })).toBeVisible();
    await expect(page.getByText(/Apoiou isenção:/)).toBeVisible();
    await expect(page.getByText(/Rejeitou isenção:/)).toBeVisible();
    await expect(page.getByText(/Abstenção:/)).toBeVisible();
    await expect(page.getByText(/Ausente:/)).toBeVisible();
    await expect(page.getByText(/Sem voto individual:/)).toBeVisible();
  });

  test("11 pills de pauta, a primeira ativa", async ({ page }) => {
    for (const rotulo of PAUTAS) {
      await expect(page.getByRole("button", { name: rotulo })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: PAUTAS[0] })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);
  });

  test("filtros presentes: busca e UF", async ({ page }) => {
    await expect(page.getByPlaceholder(/Buscar por nome/i)).toBeVisible();
    const select = page.getByLabel("Filtrar por estado");
    await expect(select).toBeVisible();
    await expect(select.locator("option")).toHaveCount(28); // TODOS + 27 UFs
    await expect(select).toHaveValue("TODOS");
  });

  test("card mostra o total de votos (TSE) ao lado do nome", async ({ page, request }) => {
    const dados = (await (await request.get("/data/parlamentares.json")).json()) as Array<{
      nome: string;
      votosEleicao: number;
    }>;
    const comVotos = dados.find((p) => p.votosEleicao > 0) as {
      nome: string;
      votosEleicao: number;
    };

    await page.goto("/");
    await esperarTodos(page);

    const chip = page.locator(`[data-nome="${comVotos.nome}"] [data-votos]`).first();
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute("data-votos", String(comVotos.votosEleicao));
    await expect(chip).toContainText("🗳️");
    // Número abreviado na tela (ex.: 1,5M / 641k), com o exato no title.
    await expect(chip).toContainText(numeroCompacto(comVotos.votosEleicao));
    await expect(chip).toHaveAttribute(
      "title",
      new RegExp(`${comVotos.votosEleicao.toLocaleString("pt-BR")}`.replace(/\./g, "\\.")),
    );
  });

  test("rodapé com o link do manifesto", async ({ page }) => {
    const link = page.getByRole("link", { name: /Manifesto Cívico/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/sobre");
    await expect(page.getByText(/Não há pedido de voto/i)).toBeVisible();
  });
});
