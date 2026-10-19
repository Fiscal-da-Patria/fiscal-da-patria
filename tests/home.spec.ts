import { test, expect } from "@playwright/test";
import { numeroCompacto } from "../src/lib/parlamentares";
import { PAUTAS, TOTAL_PARLAMENTARES, esperarCards, esperarTodos } from "./helpers";

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

  test("o HTML já entrega os cards sem depender de fetch no cliente", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    const resposta = await page.goto("/");
    expect(resposta?.status()).toBe(200);
    await expect(page.locator("[data-nome]").first()).toBeVisible();
    await expect(page.getByText(/Carregando os dados/i)).toHaveCount(0);
    await context.close();
  });

  test("header: marca, link 'Sobre o projeto' e selo", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Fiscal da Pátria/i }).first()).toBeVisible();
    const sobre = page.locator("header").getByRole("link", { name: "Sobre o projeto" });
    await expect(sobre).toBeVisible();
    await expect(sobre).toHaveAttribute("href", "/sobre");
    await expect(page.getByText("Dados oficiais")).toBeVisible();
  });

  test("faixa de auditoria mostra totais e data de atualização", async ({ page }) => {
    await expect(page.getByText(`${TOTAL_PARLAMENTARES} parlamentares`)).toBeVisible();
    await expect(page.getByText(`${PAUTAS.length} pautas`, { exact: true })).toBeVisible();
    await expect(page.getByText("100% fonte oficial")).toBeVisible();
    await expect(page.getByText(/Atualizado em \d{2}\/\d{2}\/\d{4}/)).toBeVisible();
  });

  test("card mostra o voto bruto ao lado do rótulo factual", async ({ page }) => {
    await esperarCards(page);
    const status = page.locator("[data-status-linha]").filter({ hasText: "Rejeitou isenção" }).first();
    await expect(status).toContainText("NÃO");
  });

  test("carrega a base completa e mostra o contador", async ({ page }) => {
    await esperarTodos(page);
    // O contador mostra a paginação honesta: "Mostrando 20 de 594 parlamentar(es)".
    await expect(
      page.getByText(new RegExp(`Mostrando \\d+ de ${TOTAL_PARLAMENTARES} parlamentar\\(es\\)`)),
    ).toBeVisible();
  });

  test("cards exibem foto, o voto factual e as ações", async ({ page }) => {
    await esperarTodos(page);
    await expect(page.locator('img[src^="/fotos/"]').first()).toBeVisible();
    await expect(
      page.getByText(/(Apoiou|Rejeitou) isenção|Abstenção|Ausente|Sem voto individual/).first(),
    ).toBeVisible();
    // Cada card tem a fonte oficial e a ação de compartilhar.
    await expect(page.locator("[data-fonte-card]").first()).toBeVisible();
    await expect(page.locator("[data-compartilhar-card]").first()).toBeVisible();
  });

  test("o partido aparece em negrito no card", async ({ page }) => {
    await esperarCards(page);
    const partido = page.locator("[data-partido]").first();
    await expect(partido).toBeVisible();
    await expect(partido).toHaveClass(/font-bold/);
    await expect(partido).toHaveCSS("font-weight", "700");
  });

  test("hemiciclo com legenda completa", async ({ page }) => {
    await expect(page.getByRole("img", { name: /Distribuição dos votos/i })).toBeVisible();
    await expect(page.getByText(/Apoiou isenção:/)).toBeVisible();
    await expect(page.getByText(/Rejeitou isenção:/)).toBeVisible();
    await expect(page.getByText(/Abstenção:/)).toBeVisible();
    await expect(page.getByText(/Ausente:/)).toBeVisible();
    await expect(page.getByText(/Sem voto individual:/)).toBeVisible();
  });

  test("12 pills de pauta, a primeira ativa", async ({ page }) => {
    for (const rotulo of PAUTAS) {
      await expect(page.getByRole("button", { name: rotulo })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: PAUTAS[0] })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-pautas-pills] button[aria-pressed="true"]')).toHaveCount(1);
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
    const link = page.locator("footer").getByRole("link", { name: /Sobre o projeto/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/sobre");
    await expect(page.getByText(/Não há pedido de voto/i)).toBeVisible();
  });
});
