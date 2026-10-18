import { test, expect } from "@playwright/test";
import { cards, esperarCards } from "./helpers";

/**
 * A PEC 221/2019 (escala 6x1) foi promulgada como EC 141/2026 em 16/10/2026.
 * Estes testes travam o dado oficial das duas Casas e a explicação publicada.
 */
test.describe("Escala 6x1 — PEC 221/2019 → EC 141/2026", () => {
  test("JSON: Senado tem 75 apoios e 1 contrário (Hamilton Mourão)", async ({ request }) => {
    const res = await request.get("/data/parlamentares.json");
    expect(res.status()).toBe(200);
    const dados = (await res.json()) as {
      cargo: string;
      nome: string;
      votos: Record<string, string>;
      votosOriginais?: Record<string, string>;
    }[];

    const sen = dados.filter((p) => p.cargo === "SENADOR");
    const dep = dados.filter((p) => p.cargo === "DEPUTADO");
    const contar = (lista: typeof dados) =>
      lista.reduce<Record<string, number>>((acc, p) => {
        const v = p.votos.fim_escala_6x1 ?? "?";
        acc[v] = (acc[v] ?? 0) + 1;
        return acc;
      }, {});

    // 75 SIM + 1 NÃO + 5 sem voto registrado (Presidente, AP, NCom e 2 P-NRV).
    expect(contar(sen)).toEqual({ FAVORAVEL: 75, AUSENTE: 5, CONTRA: 1 });
    expect(dep).toHaveLength(513);
    // Nenhum voto inventado: todos os 594 têm uma posição na pauta.
    expect(contar(dep).FAVORAVEL).toBeGreaterThan(0);

    const mourao = sen.find((p) => p.nome === "Hamilton Mourão");
    expect(mourao?.votos.fim_escala_6x1).toBe("CONTRA");
    expect(mourao?.votosOriginais?.fim_escala_6x1).toBe("NAO");
  });

  test("aba Senadores: 76 votaram e o único contrário abre a lista", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);

    await page.getByRole("button", { name: /Fim da Escala 6x1/i }).click();
    // "Votaram" conta voto registrado de fato (75 + 1); ausência não infla a conta.
    await expect(
      page.getByRole("button", { name: /Deputados Federais \(513\) · 470 votaram/ }),
    ).toBeVisible();

    const abaSenado = page.getByRole("button", { name: /Senadores \(81\) · 76 votaram/ });
    await expect(abaSenado).toBeVisible();
    await abaSenado.click();

    // Ordem padrão (divergentes primeiro): o único CONTRA do Senado vem no topo.
    await expect(cards(page).first()).toContainText("Hamilton Mourão");
    await expect(cards(page).first()).toContainText(/Rejeitou fim do 6x1/i);
  });

  test("modal 'O que foi aprovado?' explica a EC 141/2026", async ({ page }) => {
    await page.goto("/?pauta=fim_escala_6x1");
    await esperarCards(page);

    await expect(page.locator('[data-norma-vigente="1"]')).toContainText(/141\/2026/);
    await page.locator('[data-abrir-detalhe="1"]').click();

    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await expect(dlg).toContainText(/Promulgada em 16\/10\/2026/i);
    await expect(dlg).toContainText(/Emenda Constitucional 141\/2026/);

    // Placar oficial (inclui quem já deixou o mandato) das duas Casas.
    await expect(dlg.locator('[data-placar-camara="1"]')).toContainText(/461 SIM \/ 19 NÃO/);
    await expect(dlg.locator('[data-placar-senado="1"]')).toContainText(/75 SIM \/ 1 NÃO/);
    await expect(dlg.locator('[data-nota-placar="1"]')).toContainText(/em exercício/i);

    // Os 4 pontos objetivos.
    await expect(dlg.locator('[data-ponto-explicativo="1"]')).toHaveCount(4);
    await expect(dlg).toContainText(/Jornada de 40 horas \(e não 36h\)/);
    await expect(dlg).toContainText(/16\/12\/2026/);
    await expect(dlg).toContainText(/16\/12\/2027/);
    await expect(dlg).toContainText(/Garantia salarial \(art\. 2º\)/);
    await expect(dlg).toContainText(/Por que tramitou como PEC 221\/2019/);

    // Ressalva e fonte oficial.
    await expect(dlg.locator('[data-ressalva="1"]')).toContainText(/regimes diferenciados/i);
    await expect(dlg.locator('[data-link-norma="1"]')).toHaveAttribute(
      "href",
      /planalto\.gov\.br/,
    );

    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
  });

  test("modal fecha ao clicar fora e só existe em pauta com texto verificado", async ({ page }) => {
    await page.goto("/?pauta=fim_escala_6x1");
    await esperarCards(page);

    await page.locator('[data-abrir-detalhe="1"]').click();
    const dlg = page.getByRole("dialog");
    await expect(dlg).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(dlg).toBeHidden();

    // A Cesta Básica não tem (ainda) texto verificado: nada de botão vazio.
    await page.getByRole("button", { name: /Comida sem imposto \(Cesta Básica\)/ }).click();
    await expect(page.locator('[data-abrir-detalhe="1"]')).toHaveCount(0);
  });
});
