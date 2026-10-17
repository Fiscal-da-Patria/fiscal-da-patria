import { test, expect, type Page } from "@playwright/test";
import { cards, carregarTodos } from "./helpers";

/** Card de um deputado específico (o atributo data-nome é a chave estável). */
const cardDe = (page: Page, nome: string) => page.locator(`[data-nome="${nome}"]`);

test.describe("Deep links (Dark Social)", () => {
  test("?dep=<id> filtra pela pessoa e normaliza a URL para ?deputado=", async ({ page }) => {
    await page.goto("/?dep=74646");
    await expect(page.getByPlaceholder(/Buscar por nome/i)).toHaveValue(/Aécio Neves/i, {
      timeout: 30_000,
    });
    await expect(page).toHaveURL(/\?deputado=camara-74646$/);
    await expect(page.locator('[data-focado="1"]')).toContainText("Aécio Neves");
  });

  test("?id=<id> funciona como alias", async ({ page }) => {
    await page.goto("/?id=74646");
    await expect(page.locator('[data-focado="1"]')).toBeVisible({ timeout: 30_000 });
  });

  test("?dep inválido não quebra a página (mostra a lista normal)", async ({ page }) => {
    await page.goto("/?dep=999999999");
    await carregarTodos(page);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(cardDe(page, "Aécio Neves")).toBeVisible();
  });

  test("?busca=<nome> já entra com a lista filtrada", async ({ page }) => {
    await page.goto("/?busca=Aécio");
    await expect(page.getByPlaceholder(/Buscar por nome/i)).toHaveValue("Aécio");
    await expect(cardDe(page, "Aécio Neves")).toBeVisible({ timeout: 30_000 });
    await expect.poll(async () => await cards(page).count(), { timeout: 8_000 }).toBeLessThan(10);
  });

  test("?q=<partido> funciona como alias de busca", async ({ page }) => {
    await page.goto("/?q=PSDB");
    await expect(page.getByPlaceholder(/Buscar por nome/i)).toHaveValue("PSDB");
    await expect.poll(async () => await cards(page).count(), { timeout: 30_000 }).toBeGreaterThan(0);
  });

  test("abrir e fechar o compartilhamento mantém a barra de endereço copiável", async ({
    page,
  }) => {
    await page.goto("/");
    await carregarTodos(page);
    await cardDe(page, "Aécio Neves").locator("[data-compartilhar-card]").click();
    await expect(page).toHaveURL(/\?deputado=camara-74646$/);

    await page.getByRole("dialog").getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).not.toHaveURL(/deputado=/);
  });

  test("deep link de busca + pauta juntos", async ({ page }) => {
    await page.goto("/?busca=PSDB&pauta=fim_blindagem");
    await expect(page.getByPlaceholder(/Buscar por nome/i)).toHaveValue("PSDB");
    await expect(
      page.getByRole("button", { name: /Fim da blindagem de políticos/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
