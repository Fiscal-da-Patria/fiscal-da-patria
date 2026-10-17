import { expect, type Page } from "@playwright/test";

/** Rótulos populares das 11 pautas (8 auditadas na Câmara + 3 no Senado). */
export const PAUTAS = [
  "Comida sem imposto (Cesta Básica)",
  "Salário igual para trabalho igual",
  "Fim da blindagem de políticos",
  "Salário livre de IR (isenção do Imposto de Renda)",
  "Cobrar imposto dos super-ricos",
  "Teto para o juro do cartão",
  "Piso salarial da enfermagem",
  "Fim da escala 6x1 (36h em 10 anos)",
  "Aposentadoria dos agentes de saúde e de endemias",
  "Lei mais dura contra o crime organizado",
  "Aliviar o preço da energia (choque internacional)",
];

/** Slugs internos das 11 pautas. */
export const SLUGS = [
  "cesta_basica",
  "igualdade_salarial",
  "fim_blindagem",
  "ir_isento",
  "super_ricos",
  "teto_juro_cartao",
  "piso_enfermagem",
  "fim_escala_6x1",
  "aposentadoria_agentes_saude",
  "crime_organizado",
  "preco_energia",
];

export const TOTAL_DEPUTADOS = 513;
export const TOTAL_SENADORES = 81;
/** Congresso Nacional completo (Câmara + Senado). */
export const TOTAL_PARLAMENTARES = TOTAL_DEPUTADOS + TOTAL_SENADORES;

/** Cards de parlamentar (o atributo data-nome é a chave estável). */
export function cards(page: Page) {
  return page.locator("[data-nome]");
}

/** Espera aparecer o primeiro card (dados carregados via fetch). */
export async function esperarCards(page: Page): Promise<void> {
  await expect(cards(page).first()).toBeVisible({ timeout: 30_000 });
}

/**
 * A lista da home agora carrega **de 20 em 20** ("Carregar mais").
 * Este helper clica no botão até a lista terminar (ou falha alto, para não
 * mascarar um bug de paginação com um loop infinito).
 */
export async function carregarTodos(page: Page): Promise<void> {
  await esperarCards(page);
  const botao = page.locator('[data-carregar-mais="1"]');
  for (let i = 0; i < 80; i++) {
    if ((await botao.count()) === 0) return;
    await botao.click();
    await page.waitForTimeout(40);
  }
  throw new Error("carregarTodos: a lista não terminou de carregar depois de 80 cliques");
}

/** Espera a base completa (594 parlamentares) estar renderizada. */
export async function esperarTodos(page: Page): Promise<void> {
  await carregarTodos(page);
  await expect
    .poll(async () => await cards(page).count(), { timeout: 25_000 })
    .toBe(TOTAL_PARLAMENTARES);
}

/** Abre o modal de compartilhamento do primeiro card e retorna o dialog. */
export async function abrirCompartilhar(page: Page) {
  await esperarCards(page);
  await page.locator("[data-compartilhar-card]").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}
