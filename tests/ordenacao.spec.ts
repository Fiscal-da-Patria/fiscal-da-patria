import { test, expect } from "@playwright/test";
import { ordenarParlamentares } from "../src/lib/parlamentares";
import { carregarTodos, esperarCards, TOTAL_PARLAMENTARES } from "./helpers";
import type { AlinhamentoVoto, ParlamentarConsolidado } from "../src/types/parlamentar";

const SLUG = "fim_blindagem";

function fake(
  nome: string,
  alinhamento: AlinhamentoVoto,
  votosEleicao = 0,
): ParlamentarConsolidado {
  return {
    id: "camara-1",
    cargo: "DEPUTADO",
    nome,
    partido: "XX",
    uf: "SP",
    fotoUrl: "/fotos/1.jpg",
    email: "",
    urlPerfilOficial: "https://www.camara.leg.br/deputados/1",
    votosEleicao,
    votos: { [SLUG]: alinhamento },
    votosOriginais: {},
    motivos: {},
  };
}

const conjunto = () => [
  fake("Bruno", "FAVORAVEL"),
  fake("Ana", "CONTRA"),
  fake("Daniel", "AUSENTE"),
  fake("Carla", "ABSTENCAO"),
];

test.describe("Ordenação (unidade)", () => {
  test("piores: CONTRA → FAVORÁVEL → ABSTENÇÃO/AUSENTE", () => {
    expect(ordenarParlamentares(conjunto(), SLUG, "piores").map((p) => p.nome)).toEqual([
      "Ana",
      "Bruno",
      "Carla",
      "Daniel",
    ]);
  });

  test("melhores: FAVORÁVEL → CONTRA → ABSTENÇÃO/AUSENTE", () => {
    expect(ordenarParlamentares(conjunto(), SLUG, "melhores").map((p) => p.nome)).toEqual([
      "Bruno",
      "Ana",
      "Carla",
      "Daniel",
    ]);
  });

  test("desempate por votosEleicao (dec) e depois nome", () => {
    const dados = [
      fake("Ana", "CONTRA", 100),
      fake("Beatriz", "CONTRA", 500),
      fake("Carla", "CONTRA"),
    ];
    expect(ordenarParlamentares(dados, SLUG, "piores").map((p) => p.nome)).toEqual([
      "Beatriz",
      "Ana",
      "Carla",
    ]);
  });

  test("quem não tem registro na pauta conta como AUSENTE", () => {
    const semRegistro = fake("Zeca", "FAVORAVEL");
    semRegistro.votos = {};
    const dados = [semRegistro, fake("Ana", "CONTRA")];
    expect(ordenarParlamentares(dados, SLUG, "piores").map((p) => p.nome)).toEqual(["Ana", "Zeca"]);
  });

  test("intercalado: 1 CONTRA / 1 A FAVOR, sempre pelos mais votados", () => {
    const dados = [
      fake("C1", "CONTRA", 900),
      fake("C2", "CONTRA", 500),
      fake("F1", "FAVORAVEL", 800),
      fake("F2", "FAVORAVEL", 100),
      fake("A1", "AUSENTE", 700),
    ];
    expect(ordenarParlamentares(dados, SLUG, "intercalado").map((p) => p.nome)).toEqual([
      "C1",
      "F1",
      "C2",
      "F2",
      "A1",
    ]);
  });

  test("também ordena por 'mais votados na eleição' (sem olhar o voto)", () => {
    const dados = [
      fake("Ana", "FAVORAVEL", 100),
      fake("Beatriz", "CONTRA", 900),
      fake("Carla", "AUSENTE", 500),
    ];
    expect(ordenarParlamentares(dados, SLUG, "maisVotados").map((p) => p.nome)).toEqual([
      "Beatriz",
      "Carla",
      "Ana",
    ]);
  });

  test("NAO_APLICAVEL vai para o fim (não havia voto individual a julgar)", () => {
    const dados = [fake("Ana", "NAO_APLICAVEL", 500), fake("Bruno", "CONTRA")];
    expect(ordenarParlamentares(dados, SLUG, "piores").map((p) => p.nome)).toEqual([
      "Bruno",
      "Ana",
    ]);
    expect(ordenarParlamentares(dados, SLUG, "melhores").map((p) => p.nome)).toEqual([
      "Bruno",
      "Ana",
    ]);
  });

  test("não muta o array original", () => {
    const dados = [fake("Bruno", "FAVORAVEL"), fake("Ana", "CONTRA")];
    ordenarParlamentares(dados, SLUG, "piores");
    expect(dados.map((p) => p.nome)).toEqual(["Bruno", "Ana"]);
  });
});

test.describe("Ordenação (interface)", () => {
  test("padrão é 'piores': votaram CONTRA no topo da pauta ativa", async ({ page, request }) => {
    const dados = (await (
      await request.get("/data/parlamentares.json")
    ).json()) as ParlamentarConsolidado[];
    const slug = "cesta_basica";
    const contras = dados
      .filter((p) => p.votos[slug] === "CONTRA")
      .sort(
        (a, b) =>
          (b.votosEleicao ?? 0) - (a.votosEleicao ?? 0) || a.nome.localeCompare(b.nome, "pt-BR"),
      );
    const esperados = contras.slice(0, 25).map((p) => p.nome);

    await page.goto("/");
    await esperarCards(page);

    await expect(page.getByText(/posicionamento contrário à proposta/i)).toBeVisible();
    await expect(page.getByLabel("Ordenar a lista")).toHaveValue("piores");

    await carregarTodos(page);
    const nomes = await page
      .locator("[data-nome]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-nome")));
    expect(nomes.length).toBe(TOTAL_PARLAMENTARES);
    expect(nomes.slice(0, 25)).toEqual(esperados);
  });

  test("'melhores' mostra o banner A FAVOR", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByLabel("Ordenar a lista").selectOption("melhores");
    await expect(page.getByText(/posicionamento favorável à proposta/i)).toBeVisible();
  });

  test("o seletor não oferece mais a ordem alfabética (A-Z)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const opcoes = await page.getByLabel("Ordenar a lista").locator("option").allInnerTexts();
    expect(opcoes).toHaveLength(4);
    expect(opcoes.join(" ")).not.toMatch(/alfab/i);
  });

  test("'intercalado' no seletor: CONTRA e A FAVOR alternando no topo", async ({
    page,
    request,
  }) => {
    const dados = (await (
      await request.get("/data/parlamentares.json")
    ).json()) as ParlamentarConsolidado[];
    const slug = "cesta_basica";
    const porVotos = (a: ParlamentarConsolidado, b: ParlamentarConsolidado) =>
      b.votosEleicao - a.votosEleicao || a.nome.localeCompare(b.nome, "pt-BR");
    const contraTop = dados.filter((p) => p.votos[slug] === "CONTRA").sort(porVotos)[0].nome;
    const favorTop = dados.filter((p) => p.votos[slug] === "FAVORAVEL").sort(porVotos)[0].nome;

    await page.goto("/");
    await esperarCards(page);
    await page.getByLabel("Ordenar a lista").selectOption("intercalado");
    await expect(page.getByText(/forma intercalada/i)).toBeVisible();

    const nomes = await page
      .locator("[data-nome]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-nome")));
    expect(nomes[0]).toBe(contraTop);
    expect(nomes[1]).toBe(favorTop);
  });

  test("trocar de pauta reseta a ordenação para 'piores'", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const seletor = page.getByLabel("Ordenar a lista");
    await seletor.selectOption("maisVotados");
    await expect(seletor).toHaveValue("maisVotados");

    await page.getByRole("button", { name: /Fim da blindagem de políticos/i }).click();
    await expect(seletor).toHaveValue("piores");
    await expect(
      page.getByText(/posicionamento contrário à proposta|Apoiou blindagem/i).first(),
    ).toBeVisible();
  });

  test("o card destaca o status da pauta ativa", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await expect(
      page.locator("[data-nome]").first().getByText("Rejeitou isenção"),
    ).toBeVisible();
  });
});
