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
  "Fim da escala 6x1 (jornada de 36 horas)",
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

/** Botões "Ver dossiê" = um por card de deputado. */
export function cards(page: Page) {
  return page.getByRole("button", { name: "Ver dossiê" });
}

/** Espera aparecer o primeiro card (dados carregados via fetch). */
export async function esperarCards(page: Page): Promise<void> {
  await expect(cards(page).first()).toBeVisible({ timeout: 30_000 });
}

/** Espera a base completa (594 parlamentares) estar renderizada. */
export async function esperarTodos(page: Page): Promise<void> {
  await esperarCards(page);
  await expect
    .poll(async () => await cards(page).count(), { timeout: 25_000 })
    .toBe(TOTAL_PARLAMENTARES);
}

/** Abre o dossiê do primeiro deputado e retorna o modal. */
export async function abrirPrimeiroDossie(page: Page) {
  await esperarCards(page);
  await cards(page).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}
