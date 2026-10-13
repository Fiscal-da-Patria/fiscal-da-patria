import { test, expect } from "@playwright/test";
import { explicarPontuacao } from "../src/lib/parlamentares";
import { cards, esperarCards } from "./helpers";
import type { AlinhamentoVoto, ParlamentarConsolidado } from "../src/types/parlamentar";

/** Parlamentar sintético com a distribuição exata do caso real (Romário, senador). */
function fake(votos: Record<string, AlinhamentoVoto>): ParlamentarConsolidado {
  return {
    id: "senado-1",
    cargo: "SENADOR",
    nome: "Fulano de Tal",
    partido: "XX",
    uf: "RJ",
    fotoUrl: "/fotos/sen-1.jpg",
    urlPerfilOficial: "https://www25.senado.leg.br/web/senadores/senador/-/perfil/1",
    pontuacaoCivica: 0,
    votosEleicao: 2_384_331,
    votos,
  };
}

test.describe("Alinhamento Cívico — como o % é calculado", () => {
  test("unidade: 2 a favor de 4 aplicáveis = 50% (7 sem voto individual não contam)", () => {
    const p = fake({
      cesta_basica: "CONTRA",
      aposentadoria_agentes_saude: "FAVORAVEL",
      crime_organizado: "AUSENTE",
      preco_energia: "FAVORAVEL",
      igualdade_salarial: "NAO_APLICAVEL",
      fim_blindagem: "NAO_APLICAVEL",
      ir_isento: "NAO_APLICAVEL",
      super_ricos: "NAO_APLICAVEL",
      teto_juro_cartao: "NAO_APLICAVEL",
      piso_enfermagem: "NAO_APLICAVEL",
      fim_escala_6x1: "NAO_APLICAVEL",
    });

    const exp = explicarPontuacao(p);
    expect(exp.aplicaveis).toBe(4);
    expect(exp.total).toBe(11);
    expect(exp.favoraveis).toBe(2);
    expect(exp.contras).toBe(1);
    expect(exp.ausentes).toBe(1);
    expect(exp.semVoto).toBe(7);
    expect(exp.pontos).toBe(2);
    expect(exp.percentual).toBe(50);
    expect(exp.detalhe).toMatch(/2 a favor × 1/);
    expect(exp.detalhe).toMatch(/÷ 4 votações aplicáveis \(de 11\) = 50%/);
  });

  test("unidade: abstenção vale 0,3 e sem voto individual não entra", () => {
    const p = fake({
      cesta_basica: "FAVORAVEL",
      preco_energia: "ABSTENCAO",
      crime_organizado: "CONTRA",
      igualdade_salarial: "NAO_APLICAVEL",
    });
    const exp = explicarPontuacao(p);
    // 1 a favor (1) + 1 abstenção (0,3) = 1,3 ÷ 3 aplicáveis = 43%
    expect(exp.aplicaveis).toBe(3);
    expect(exp.percentual).toBe(43);
  });

  test("a metodologia fica na /sobre#metodologia, com a fórmula e o exemplo real", async ({
    page,
  }) => {
    await page.goto("/sobre#metodologia");
    const secao = page.locator("#metodologia");

    await expect(
      secao.getByRole("heading", { name: /Como calculamos o Alinhamento Cívico/i }),
    ).toBeVisible();
    await expect(secao.getByText(/Apoiou a proposta/i).first()).toBeVisible();
    await expect(secao.getByText(/Abstenção\s*=\s*0,3 ponto/i)).toBeVisible();
    await expect(secao.getByText(/Rejeitou a proposta/i).first()).toBeVisible();
    await expect(secao.getByText(/não entra na conta/i).first()).toBeVisible();
    await expect(secao.getByText(/rótulo factual/i).first()).toBeVisible();
    await expect(secao.getByText(/2 ÷ 4 = 50%/i).first()).toBeVisible();
    await expect(
      secao.getByRole("link", { name: /dadosabertos\.camara\.leg\.br/i }),
    ).toBeVisible();
  });

  test("home e dossiê apontam para a metodologia (e a ficha fica limpa)", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    await expect(page.getByRole("link", { name: /Ver a metodologia/i })).toHaveAttribute(
      "href",
      "/sobre#metodologia",
    );
    await expect(page.getByText(/só entram as votações com voto individual/i)).toBeVisible();

    await cards(page).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("link", { name: /ver a metodologia/i })).toHaveAttribute(
      "href",
      "/sobre#metodologia",
    );
    // O cálculo saiu da ficha: aqui fica só o atalho.
    await expect(dialog.locator('[data-explicacao="pontuacao"]')).toHaveCount(0);
  });

  test("na ficha: a votação em foco aparece antes da visão geral", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await cards(page).first().click();

    const dialog = page.getByRole("dialog");
    const destaque = dialog.locator('[data-destaque="pauta"]');
    await expect(destaque).toBeVisible();
    await expect(destaque.getByText(/Você está vendo esta votação/i)).toBeVisible();
    await expect(destaque.getByText(/Comida sem imposto/i)).toBeVisible();
    await expect(destaque.getByText(/PEC 45\/2019/)).toBeVisible();

    // O bloco em destaque vem ANTES da visão geral das 11 pautas.
    const caixas = await dialog.evaluate((el) => {
      const destaqueBox = el.querySelector('[data-destaque="pauta"]') as HTMLElement | null;
      const geralBox = el.querySelector("h3") as HTMLElement | null;
      const geral =
        el.querySelector('[data-explicacao="pontuacao"]')?.closest("div") ?? geralBox;
      if (!destaqueBox || !geral) return null;
      return destaqueBox.getBoundingClientRect().top < geral.getBoundingClientRect().top;
    });
    expect(caixas).toBe(true);
  });

  test("trocar de pauta troca a votação em foco no dossiê", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Fim da escala 6x1/i }).click();
    await cards(page).first().click();

    const destaque = page.getByRole("dialog").locator('[data-destaque="pauta"]');
    await expect(destaque.getByText(/PEC 221\/2019/)).toBeVisible();
    await expect(destaque).not.toContainText("PEC 45/2019");
  });
});
