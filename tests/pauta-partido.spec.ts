import { test, expect } from "@playwright/test";
import { PAUTAS, TOTAL_PARLAMENTARES, abrirCompartilhar, esperarCards } from "./helpers";

/** Extrai um parâmetro de uma URL de compartilhamento. */
const param = (href: string, chave: string) => new URL(href).searchParams.get(chave) ?? "";

test.describe("Pills: 5 principais + Ver todas no mobile", () => {
  test("expande as 12 sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const pills = page.locator("[data-pautas-pills] button[aria-pressed]");
    await expect(pills).toHaveCount(PAUTAS.length);
    await expect(pills.nth(0)).toBeVisible();
    await expect(pills.nth(5)).toBeHidden();

    const toggle = page.locator('button[aria-controls="lista-pautas"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toContainText(/Mostrar menos/i);

    for (const rotulo of PAUTAS) {
      await expect(page.getByRole("button", { name: rotulo })).toBeVisible();
    }

    // A caixa das pills quebra linha e não usa rolagem horizontal.
    const caixa = pills.first().locator("xpath=..");
    await expect(caixa).toHaveClass(/flex-wrap/);
    await expect(caixa).not.toHaveClass(/overflow-x-auto/);

    // Última pauta (a do Senado) realmente cabe na tela depois de expandir.
    const ultima = page.getByRole("button", { name: PAUTAS[PAUTAS.length - 1] });
    const cx = await ultima.boundingBox();
    expect(cx).not.toBeNull();
    expect((cx?.x ?? 0) + (cx?.width ?? 0)).toBeLessThanOrEqual(390);
  });

  test("deep link de pauta fora das 5 mantém a ativa visível", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?pauta=igualdade_salarial");
    await esperarCards(page);

    const ativa = page.locator('[data-pautas-pills] button[aria-pressed="true"]');
    await expect(ativa).toBeVisible();
    await expect(ativa).toContainText(/Salário igual/i);
  });
});

test.describe("Compartilhar a PAUTA como assunto central", () => {
  test("botão da votação selecionada leva a matéria + link profundo da pauta", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    const btn = page.getByRole("link", { name: /Compartilhar esta votação/i });
    await expect(btn).toHaveAttribute("href", /^https:\/\/api\.whatsapp\.com\/send\?text=/);

    const texto = param((await btn.getAttribute("href")) as string, "text");
    expect(texto).toMatch(/Comida sem imposto/i);
    expect(texto).toMatch(/PEC 45\/2019/);
    expect(texto).toContain("fiscaldapatria.org.br/?pauta=cesta_basica");
  });

  test("trocar de pauta troca o texto compartilhado", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Lei mais dura contra o crime organizado/i }).click();

    const href = (await page
      .getByRole("link", { name: /Compartilhar esta votação/i })
      .getAttribute("href")) as string;
    const texto = param(href, "text");
    expect(texto).toMatch(/crime organizado/i);
    expect(texto).toMatch(/PL 5582\/2025/);
    expect(texto).toContain("/?pauta=crime_organizado");
  });

  test("cada card compartilha a matéria ativa (texto factual + deep link dos dois)", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3000",
    });
    await page.goto("/");
    const dialog = await abrirCompartilhar(page);
    await dialog.locator('[data-copiar-link="1"]').click();

    const texto = await page.evaluate(() => navigator.clipboard.readText());
    // A pauta é o assunto central + o voto do parlamentar específico + deep link dos dois.
    expect(texto).toMatch(/Comida sem imposto/i);
    expect(texto).toMatch(/PEC 45\/2019/);
    expect(texto).toMatch(/deputado federal|senador/i);
    expect(texto).toMatch(/\?deputado=(camara|senado)-\d+&pauta=cesta_basica/);
  });

  test("a imagem 4:5 traz a matéria ativa e o botão de baixar", async ({ page }) => {
    await page.goto("/");
    const dialog = await abrirCompartilhar(page);

    const cartao = dialog.locator("[data-share-card]");
    await expect(cartao).toBeVisible();
    await expect(cartao).toContainText("PEC 45/2019");
    await expect(cartao).toContainText(/Comida sem imposto \(Cesta Básica\)/i);
    await expect(dialog.locator('[data-baixar-imagem="1"]')).toBeVisible();
  });
});

test.describe("Gráfico: como cada partido votou", () => {
  test("ordena pelas maiores bancadas (desempate: quem mais votou contra)", async ({
    page,
    request,
  }) => {
    const dados = (await (await request.get("/data/parlamentares.json")).json()) as Array<{
      partido: string;
      votos: Record<string, string>;
    }>;
    const contagem = new Map<string, { total: number; contra: number }>();
    for (const p of dados) {
      const atual = contagem.get(p.partido) ?? { total: 0, contra: 0 };
      atual.total += 1;
      if (p.votos.cesta_basica === "CONTRA") atual.contra += 1;
      contagem.set(p.partido, atual);
    }
    const campeao = [...contagem.entries()]
      .map(([partido, c]) => ({ partido, ...c }))
      .sort(
        (a, b) =>
          b.total - a.total || b.contra - a.contra || a.partido.localeCompare(b.partido, "pt-BR"),
      )[0].partido;

    await page.goto("/");
    await esperarCards(page);

    const grafico = page.getByTestId("grafico-partidos");
    await expect(grafico.getByText("Como cada partido votou")).toBeVisible();
    await expect(
      grafico.getByText(new RegExp(`${TOTAL_PARLAMENTARES} parlamentar`)),
    ).toBeVisible();
    await expect(grafico.getByText(/maiores bancadas primeiro/i)).toBeVisible();
    // A 1ª bancada listada é a que tem mais votos (desempate pelos contrários).
    await expect(grafico.locator("li").first()).toContainText(campeao);
    await expect(grafico.getByText(/Rejeitou isenção/i).first()).toBeVisible();
  });

  test("colapsa em 5 partidos e o botão 'ver todos' expande", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    const grafico = page.getByTestId("grafico-partidos");
    const linhas = grafico.locator("li");
    await expect(linhas).toHaveCount(5);

    const botao = grafico.getByRole("button", { name: /Ver todos os \d+ partidos/i });
    await expect(botao).toHaveAttribute("aria-expanded", "false");
    await botao.click();

    await expect.poll(async () => await linhas.count(), { timeout: 8_000 }).toBeGreaterThan(5);
    await expect(
      grafico.getByRole("button", { name: /Mostrar menos partidos/i }),
    ).toHaveAttribute("aria-expanded", "true");

    // volta a recolher
    await grafico.getByRole("button", { name: /Mostrar menos partidos/i }).click();
    await expect(linhas).toHaveCount(5);
  });

  test("fica na mesma linha do hemiciclo (desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await esperarCards(page);

    const hemi = await page
      .getByRole("img", { name: /Distribuição dos votos/i })
      .boundingBox();
    const graf = await page.getByTestId("grafico-partidos").boundingBox();
    expect(hemi).not.toBeNull();
    expect(graf).not.toBeNull();
    // lado a lado: o gráfico começa à direita do hemiciclo, na mesma faixa vertical
    expect(graf?.x ?? 0).toBeGreaterThan(hemi?.x ?? 0);
    expect(graf?.y ?? 9_999).toBeLessThan((hemi?.y ?? 0) + (hemi?.height ?? 0));
  });

  test("segue o filtro de cargo (81 senadores)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Senadores \(81\)/ }).click();

    await expect(page.getByTestId("grafico-partidos").getByText(/81 parlamentar/i)).toBeVisible();
  });

  test("muda quando troca a pauta (composição nova)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    const grafico = page.getByTestId("grafico-partidos");
    const antes = await grafico.innerText();

    await page.getByRole("button", { name: /Aposentadoria dos agentes de saúde/i }).click();
    await expect
      .poll(async () => (await grafico.innerText()) !== antes, { timeout: 8_000 })
      .toBe(true);
  });
});
