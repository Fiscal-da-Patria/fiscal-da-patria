import { test, expect } from "@playwright/test";
import { esperarCards } from "./helpers";

test.describe("Entenda os Poderes — educação cívica", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/poderes");
  });

  test("os três Poderes trazem composição, atribuições e lembretes", async ({ page }) => {
    const legislativo = page.locator('[data-poder="legislativo"]');
    await expect(legislativo).toBeVisible();
    await expect(legislativo.getByRole("heading", { name: /Poder Legislativo/i })).toBeVisible();
    await expect(
      legislativo.getByText(/Deputados Federais \(513\) e Senadores \(81\)/i),
    ).toBeVisible();
    await expect(legislativo.getByText(/Cria e vota leis, define impostos/i)).toBeVisible();
    await expect(legislativo.getByText(/O foco do Fiscal da Pátria/i)).toBeVisible();

    const executivo = page.locator('[data-poder="executivo"]');
    await expect(executivo.getByRole("heading", { name: /Poder Executivo/i })).toBeVisible();
    await expect(
      executivo.getByText(/Presidente da República, Governadores e Prefeitos/i),
    ).toBeVisible();
    await expect(executivo.getByText(/depende do aval do Legislativo/i)).toBeVisible();

    const judiciario = page.locator('[data-poder="judiciario"]');
    await expect(judiciario.getByRole("heading", { name: /Poder Judiciário/i })).toBeVisible();
    await expect(judiciario.getByText(/STF, STJ/i)).toBeVisible();
    await expect(judiciario.getByText(/leis aprovadas pelos deputados e senadores/i)).toBeVisible();
  });

  test("o Legislativo é o destaque visual (borda dourada)", async ({ page }) => {
    const legislativo = await page.locator('[data-poder="legislativo"]').getAttribute("class");
    const executivo = await page.locator('[data-poder="executivo"]').getAttribute("class");
    const judiciario = await page.locator('[data-poder="judiciario"]').getAttribute("class");

    expect(legislativo).toContain("border-dourado");
    expect(executivo).not.toContain("border-dourado");
    expect(judiciario).not.toContain("border-dourado");
  });

  test("Câmara x Senado: voz do povo x voz dos estados", async ({ page }) => {
    const camara = page.locator('[data-casa="camara"]');
    await expect(camara.getByText(/a voz do povo/i)).toBeVisible();
    await expect(camara.getByText(/varia conforme a população/i)).toBeVisible();

    const senado = page.locator('[data-casa="senado"]');
    await expect(senado.getByText(/a voz dos estados/i)).toBeVisible();
    await expect(senado.getByText(/3 por estado/i)).toBeVisible();
  });

  test("carrossel no mobile (arrasta) e 3 colunas no desktop", async ({ page }) => {
    const trilho = page.locator('[data-poder="legislativo"]').locator("xpath=..");
    await expect(trilho).toHaveClass(/md:grid-cols-3/);
    await expect(trilho).toHaveClass(/overflow-x-auto/);

    await page.setViewportSize({ width: 390, height: 900 });
    const mobile = await page
      .locator("[data-poder]")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(Math.round(mobile[0].y)).toBe(Math.round(mobile[1].y)); // lado a lado
    expect(mobile[1].left).toBeGreaterThan(mobile[0].left);
    // o trilho realmente rola para o lado (os 3 cards não cabem em 390px)
    const rolagem = await trilho.evaluate((el) => ({
      largura: el.clientWidth,
      conteudo: el.scrollWidth,
    }));
    expect(rolagem.conteudo).toBeGreaterThan(rolagem.largura);

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktop = await page
      .locator("[data-poder]")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    // mesma linha (o destaque do Legislativo sobe 8px de propósito)
    expect(Math.abs(desktop[0].y - desktop[1].y)).toBeLessThan(20);
    expect(desktop[1].left).toBeGreaterThan(desktop[0].left);
  });

  test("botão de retorno volta para a fiscalização", async ({ page }) => {
    await page.getByRole("link", { name: /Voltar para a fiscalização/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("acessível pelo menu superior e pelo rodapé", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: /Entenda os 3 Poderes/i }).click();
    await expect(page).toHaveURL(/\/poderes$/);
    await expect(page.getByRole("heading", { name: "Entenda os Poderes" })).toBeVisible();

    await page.goto("/");
    await expect(
      page.locator("footer").getByRole("link", { name: /Entenda os 3 Poderes/i }),
    ).toHaveAttribute("href", "/poderes");
  });

  test("fecha o ciclo: explica por que fiscalizamos o Legislativo", async ({ page }) => {
    await expect(page.getByText(/Por que fiscalizamos o Legislativo/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Veja a metodologia/i })).toHaveAttribute(
      "href",
      "/sobre#metodologia",
    );
    await expect(
      page.getByRole("link", { name: /Ver como cada um votou/i }),
    ).toHaveAttribute("href", "/");
  });
});

test.describe("Régua dos votos — quóruns constitucionais", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/poderes");
  });

  test("PEC exige 3/5 (308 na Câmara e 49 no Senado), em 2 turnos e sem veto", async ({ page }) => {
    const pec = page.locator('[data-quorum="pec"]');
    await expect(pec.getByText(/Regra máxima: 3\/5/i)).toBeVisible();
    await expect(pec.locator("[data-quorum-camara]")).toHaveAttribute("data-quorum-camara", "308");
    await expect(pec.locator("[data-quorum-senado]")).toHaveAttribute("data-quorum-senado", "49");
    await expect(pec.getByText("de 513 deputados")).toBeVisible();
    await expect(pec.getByText("de 81 senadores")).toBeVisible();
    await expect(pec.getByText(/2 turnos em cada Casa/i)).toBeVisible();
    await expect(pec.getByText(/não pode vetar nem sancionar/i)).toBeVisible();
    await expect(pec.locator('[data-quorum-base="pec"]')).toContainText(/art\. 60/i);
  });

  test("lei complementar exige maioria absoluta (257/41) e o PL exige maioria simples", async ({
    page,
  }) => {
    const plp = page.locator('[data-quorum="plp"]');
    await expect(plp.getByText(/Maioria absoluta/i)).toBeVisible();
    await expect(plp.locator("[data-quorum-camara]")).toHaveAttribute("data-quorum-camara", "257");
    await expect(plp.locator("[data-quorum-senado]")).toHaveAttribute("data-quorum-senado", "41");
    await expect(plp.locator('[data-quorum-base="plp"]')).toContainText(/art\. 69/i);

    const pl = page.locator('[data-quorum="pl"]');
    await expect(pl.getByText(/Maioria simples/i)).toBeVisible();
    await expect(pl.getByText(/mais votos SIM do que NÃO/i)).toBeVisible();
    await expect(pl.locator("[data-quorum-camara]")).toContainText(/dos votos dos presentes/i);
    await expect(
      pl.getByText(/A sessão só delibera com a maioria absoluta presente: 257/i),
    ).toBeVisible();
    await expect(pl.locator('[data-quorum-base="pl"]')).toContainText(/art\. 47/i);
  });

  test("a conta sai da fonte oficial (Constituição no Planalto)", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Constituição Federal/i })).toHaveAttribute(
      "href",
      /planalto\.gov\.br\/ccivil_03\/constituicao/i,
    );
    await expect(page.getByText(/total de cadeiras/i)).toBeVisible();
  });
});

test.describe("Linha do tempo do funil legislativo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/poderes");
  });

  test("as 5 etapas aparecem na ordem, com comissões/CCJ, Casa revisora e derrubada do veto", async ({
    page,
  }) => {
    const etapas = page.locator("[data-etapa]");
    await expect(etapas).toHaveCount(5);

    const numeros = await etapas.evaluateAll((els) =>
      els.map((e) => Number(e.getAttribute("data-etapa"))),
    );
    expect(numeros).toEqual([1, 2, 3, 4, 5]);

    const funil = page.locator("#linha-do-tempo");
    await expect(funil.getByText(/A proposta nasce/i)).toBeVisible();
    await expect(funil.getByText(/iniciativa popular/i)).toBeVisible();
    await expect(funil.getByText(/O filtro das comissões/i)).toBeVisible();
    await expect(funil.getByText(/CCJ \(Comissão de Constituição e Justiça\)/i)).toBeVisible();
    await expect(funil.getByText(/513 deputados · o foco do Fiscal/i)).toBeVisible();
    await expect(funil.getByText(/Casa revisora/i)).toBeVisible();
    await expect(funil.getByText(/Volta para a Câmara, que dá a palavra final/i)).toBeVisible();
    await expect(funil.getByText(/faz a lei valer mesmo contra a vontade do governo/i)).toBeVisible();
  });

  test("os ícones da timeline continuam visíveis no tema escuro (contraste do círculo)", async ({
    page,
  }) => {
    await page.goto("/poderes");

    /** Contraste WCAG entre duas cores `rgb(...)` (fórmula de luminância relativa). */
    const contraste = (corA: string, corB: string) => {
      const luminancia = (cor: string) => {
        const [r, g, b] = cor
          .match(/\d+(\.\d+)?/g)!
          .slice(0, 3)
          .map(Number);
        const canal = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
      };
      const [maior, menor] = [luminancia(corA), luminancia(corB)].sort((x, y) => y - x);
      return (maior + 0.05) / (menor + 0.05);
    };

    for (const tema of ["claro", "escuro"] as const) {
      await page.evaluate((t) => {
        document.documentElement.classList.toggle("dark", t === "escuro");
      }, tema);

      const cores = await page
        .locator("[data-etapa]")
        .first()
        .locator("span")
        .first()
        .evaluate((el) => {
          const estilo = getComputedStyle(el);
          return { icone: estilo.color, fundo: estilo.backgroundColor };
        });

      // WCAG 1.4.11: elemento gráfico precisa de 3:1 contra o fundo vizinho.
      expect(contraste(cores.icone, cores.fundo), `tema ${tema}`).toBeGreaterThan(3);
    }
  });
});

test.describe("Âncoras, responsividade e atalhos contextuais", () => {
  test("as âncoras #regua e #linha-do-tempo abrem no topo (com header fixo)", async ({ page }) => {
    await page.goto("/poderes#regua");
    const regua = page.locator("#regua");
    await expect(regua).toBeVisible();
    expect((await regua.boundingBox())?.y ?? 9999).toBeLessThan(200);

    await page.goto("/poderes#linha-do-tempo");
    const funil = page.locator("#linha-do-tempo");
    await expect(funil).toBeVisible();
    expect((await funil.boundingBox())?.y ?? 9999).toBeLessThan(200);
  });

  test("no mobile a régua e a timeline viram carrossel; no desktop, grade", async ({
    page,
  }) => {
    await page.goto("/poderes");

    await page.setViewportSize({ width: 1280, height: 900 });
    const cartoes = await page
      .locator("[data-quorum]")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(Math.abs(cartoes[0].y - cartoes[1].y)).toBeLessThan(20); // mesma linha
    expect(cartoes[1].left).toBeGreaterThan(cartoes[0].left);

    const etapasDesktop = await page
      .locator("[data-etapa]")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(Math.round(etapasDesktop[0].y)).toBe(Math.round(etapasDesktop[1].y)); // eixo horizontal
    expect(etapasDesktop[1].left).toBeGreaterThan(etapasDesktop[0].left);

    await page.setViewportSize({ width: 390, height: 900 });
    const cartoesMobile = await page
      .locator("[data-quorum]")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(Math.round(cartoesMobile[0].y)).toBe(Math.round(cartoesMobile[1].y)); // lado a lado
    expect(cartoesMobile[1].left).toBeGreaterThan(cartoesMobile[0].left);
    expect(
      await page
        .locator("[data-quorum]")
        .first()
        .locator("xpath=..")
        .evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(true);

    const etapasMobile = await page
      .locator("[data-etapa]")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(Math.round(etapasMobile[0].y)).toBe(Math.round(etapasMobile[1].y)); // trilho horizontal
    expect(etapasMobile[1].left).toBeGreaterThan(etapasMobile[0].left);
  });

  test("atalho contextual: PEC leva à régua; projeto de lei leva à linha do tempo", async ({
    page,
  }) => {
    // Pauta padrão = PEC 45/2019 (Cesta Básica).
    await page.goto("/");
    await esperarCards(page);
    const atalho = page.locator('[data-ajuda-tramitacao="pec"]').first();
    await expect(atalho).toBeVisible();
    await expect(atalho).toHaveAttribute("href", "/poderes#regua");
    await expect(atalho).toContainText(/aprovar uma PEC/i);

    // Pauta que é projeto de lei: o atalho muda de destino e de texto.
    await page.goto("/?pauta=igualdade_salarial");
    await esperarCards(page);
    const atalhoLei = page.locator('[data-ajuda-tramitacao="lei"]').first();
    await expect(atalhoLei).toBeVisible();
    await expect(atalhoLei).toHaveAttribute("href", "/poderes#linha-do-tempo");
    await expect(atalhoLei).toContainText(/Como uma lei é aprovada/i);
  });
});
