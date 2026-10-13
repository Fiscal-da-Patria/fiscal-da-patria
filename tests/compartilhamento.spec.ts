import { test, expect } from "@playwright/test";
import { esperarCards } from "./helpers";

/** Mensagem oficial (duplicada aqui de propósito, para validação independente). */
const MSG = [
  "Gente, vocês viram isso aqui? 🚨🇧🇷",
  "Quem é patriota de verdade tem que ver antes que sumam com isso!",
  "",
  "Painel oficial mostra quem votou contra zerar o imposto da comida e quem votou para proteger político de investigação. Só fatos da Câmara!",
  "",
  "Dá uma olhada no seu deputado: 👇",
  "https://fiscaldapatria.org.br",
].join("\n");

const TEXTO_X =
  "Gente, vocês viram isso aqui? 🚨🇧🇷 O painel oficial que mostra como cada deputado votou na comida, no IR e na blindagem de políticos:\n";

const param = (href: string, chave: string) =>
  new URL(href).searchParams.get(chave) ?? "";

test.describe("Compartilhamento (Dark Social)", () => {
  test("hero: botão do WhatsApp com a mensagem oficial", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("link", { name: /Enviar no WhatsApp/i });
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute("href", /^https:\/\/api\.whatsapp\.com\/send\?text=/);
    await expect(btn).toHaveAttribute("target", "_blank");
    await expect(btn).toHaveAttribute("rel", /noopener/);
    expect(param((await btn.getAttribute("href")) as string, "text")).toBe(MSG);
  });

  test("rodapé: barra com WhatsApp, Telegram e X (links corretos)", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");

    const zap = footer.getByRole("link", { name: "WhatsApp" });
    await expect(zap).toBeVisible();
    expect(param((await zap.getAttribute("href")) as string, "text")).toBe(MSG);

    const tg = footer.getByRole("link", { name: "Telegram" });
    await expect(tg).toHaveAttribute("href", /^https:\/\/t\.me\/share\/url\?url=/);
    expect(param((await tg.getAttribute("href")) as string, "url")).toBe(
      "https://fiscaldapatria.org.br",
    );

    const x = footer.getByRole("link", { name: "X (Twitter)" });
    await expect(x).toHaveAttribute("href", /^https:\/\/x\.com\/intent\/tweet\?text=/);
    expect(param((await x.getAttribute("href")) as string, "text")).toBe(TEXTO_X);

    for (const link of [zap, tg, x]) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("rodapé: chamada de utilidade pública + Copiar Link (na home e no Sobre)", async ({ page }) => {
    for (const rota of ["/", "/sobre"]) {
      await page.goto(rota);
      await expect(page.getByText(/Ajude a espalhar a verdade/i).first()).toBeVisible();
      const footer = page.locator("footer");
      await expect(footer.getByRole("button", { name: /Copiar Link/ })).toBeVisible();
      await expect(footer.getByRole("link", { name: "Telegram" })).toBeVisible();
    }
  });

  test("Copiar Link copia a URL e mostra feedback por ~2s", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: "http://localhost:3000",
    });
    await page.goto("/");
    await esperarCards(page); // garante a hidratação antes de clicar
    const footer = page.locator("footer");
    await footer.getByRole("button", { name: /Copiar Link/ }).click();
    await expect(footer.getByRole("button", { name: /Copiado! ✓/ })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "https://fiscaldapatria.org.br",
    );
    await expect(footer.getByRole("button", { name: /Copiar Link/ })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("dossiê: barra com deep link focado no deputado", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: "Ver dossiê" }).first().click();

    const dialog = page.getByRole("dialog");
    const tg = dialog.getByRole("link", { name: "Telegram" });
    const href = (await tg.getAttribute("href")) as string;
    expect(param(href, "url")).toMatch(/fiscaldapatria\.org\.br\/\?deputado=(camara|senado)-\d+/);
    expect(param(href, "text")).toMatch(/votou nas pautas/);
  });

  test("Web Share aparece apenas quando o navegador suporta", async ({ page }) => {
    await page.goto("/");
    const suportado = await page.evaluate(() => typeof navigator.share === "function");
    const botao = page.locator("footer").getByRole("button", { name: /Mais opções/ });
    if (suportado) await expect(botao).toBeVisible();
    else await expect(botao).toHaveCount(0);
  });

  test("deep link ?deputado=<id> abre o dossiê automaticamente", async ({ page }) => {
    await page.goto("/?deputado=74646");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 30_000 });
    await expect(dialog.getByRole("heading", { name: /Aécio Neves/i }).first()).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Perfil oficial/i })).toHaveAttribute(
      "href",
      /deputados\/74646/,
    );
  });

  test("deep link ?pauta=<slug> pré-seleciona a pauta", async ({ page }) => {
    await page.goto("/?pauta=fim_blindagem");
    await expect(
      page.getByRole("button", { name: /Fim da blindagem de políticos/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("mobile: a barra fica visível e utilizável", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "WhatsApp" })).toBeVisible();
    await expect(footer.getByRole("button", { name: /Copiar Link/ })).toBeVisible();
  });
});

