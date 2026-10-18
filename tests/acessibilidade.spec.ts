import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { esperarCards } from "./helpers";

const rotas = ["/", "/sobre", "/poderes"] as const;
const temas = ["claro", "escuro"] as const;

async function definirTema(page: Page, tema: (typeof temas)[number]) {
  await page.evaluate((t) => {
    document.documentElement.classList.toggle("dark", t === "escuro");
  }, tema);
}

for (const rota of rotas) {
  for (const tema of temas) {
    test(`Acessibilidade (axe) ${rota} — tema ${tema}`, async ({ page }) => {
      await page.goto(rota);
      if (rota === "/") await esperarCards(page);
      await definirTema(page, tema);

      const { violations } = await new AxeBuilder({ page }).analyze();
      const resumo = violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`);
      if (resumo.length) console.log(`[a11y ${rota}/${tema}] ${resumo.join(", ")}`);

      const serias = violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(serias.map((v) => `${v.id}:${v.impact}`)).toEqual([]);

      // Estrutura de navegação: headings em ordem e landmarks com nome único.
      const estruturais = violations.filter(
        (v) => v.id === "heading-order" || v.id === "landmark-unique",
      );
      expect(estruturais.map((v) => `${v.id}:${v.impact}`)).toEqual([]);
    });
  }
}

type AchadoAxe = {
  id: string;
  nodes: Array<{ target: unknown; html: string; failureSummary?: string }>;
};

/** Diagnóstico rico: seletor do nó, HTML e o resumo do axe (cores + fonte). */
function relatar(rotulo: string, serias: AchadoAxe[]) {
  if (!serias.length) return;
  console.log(
    `[a11y ${rotulo}] ${serias
      .map(
        (v) =>
          `${v.id}(${v.nodes.length}): ` +
          v.nodes
            .map(
              (n) =>
                `${JSON.stringify(n.target)} ${n.html.slice(0, 160)} :: ${
                  n.failureSummary?.replace(/\s+/g, " ") ?? "?"
                }`,
            )
            .join(" | "),
      )
      .join(" ;; ")}`,
  );
}

test("Acessibilidade (axe) — modal de compartilhamento (parlamentar, bancada e top 5)", async ({
  page,
}) => {
  await page.goto("/");
  await esperarCards(page);

  // Voto de um parlamentar.
  await page.locator("[data-compartilhar-card]").first().click();
  await page.getByRole("dialog").waitFor();
  let { violations } = await new AxeBuilder({ page }).analyze();
  let serias = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  relatar("compartilhar/parlamentar", serias);
  expect(serias.map((v) => `${v.id}:${v.impact}`)).toEqual([]);
  await page.getByRole("dialog").getByRole("button", { name: "Fechar" }).click();

  // Cartão da bancada.
  await page.locator("[data-compartilhar-partido]").first().click();
  await page.getByRole("dialog").waitFor();
  ({ violations } = await new AxeBuilder({ page }).analyze());
  serias = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  relatar("compartilhar/bancada", serias);
  expect(serias.map((v) => `${v.id}:${v.impact}`)).toEqual([]);
  await page.getByRole("dialog").getByRole("button", { name: "Fechar" }).click();

  // Cartão do top 5 de bancadas.
  await page.locator("[data-compartilhar-top5]").click();
  await page.getByRole("dialog").waitFor();
  ({ violations } = await new AxeBuilder({ page }).analyze());
  serias = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  relatar("compartilhar/top5", serias);
  expect(serias.map((v) => `${v.id}:${v.impact}`)).toEqual([]);
});

for (const tema of temas) {
  test(`Acessibilidade (axe) — modal "O que foi aprovado?" — tema ${tema}`, async ({ page }) => {
    await page.goto("/?pauta=fim_escala_6x1");
    await esperarCards(page);
    await definirTema(page, tema);

    await page.locator('[data-abrir-detalhe="1"]').click();
    await page.getByRole("dialog").waitFor();

    const { violations } = await new AxeBuilder({ page }).analyze();
    const serias = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    relatar(`detalhe-pauta/${tema}`, serias);
    expect(serias.map((v) => `${v.id}:${v.impact}`)).toEqual([]);
  });
}


