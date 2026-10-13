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
    });
  }
}

test("Acessibilidade (axe) — dossiê aberto", async ({ page }) => {
  await page.goto("/");
  await esperarCards(page);
  await page.getByRole("button", { name: "Ver dossiê" }).first().click();
  await page.getByRole("dialog").waitFor();

  const { violations } = await new AxeBuilder({ page }).analyze();
  const serias = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  if (serias.length) {
    // Diagnóstico rico: seletor do nó, HTML e o resumo do axe (cores + tamanho da fonte).
    console.log(
      `[a11y dossiê] ${serias
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
  expect(serias.map((v) => `${v.id}:${v.impact}`)).toEqual([]);
});

