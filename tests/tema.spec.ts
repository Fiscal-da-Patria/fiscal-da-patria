import { test, expect } from "@playwright/test";
import { esperarCards } from "./helpers";

/** Define o tema claro só se não houver preferência salva (não sobrescreve no reload). */
function iniciarTemaClaro() {
  if (!localStorage.getItem("fiscal-tema")) localStorage.setItem("fiscal-tema", "claro");
}

/** Canais RGB de uma cor computada (`rgb(r, g, b)`). */
function canais(cor: string): [number, number, number] {
  const [r, g, b] = (cor.match(/\d+/g) ?? []).slice(0, 3).map(Number);
  return [r, g, b];
}

/** Luminância relativa (WCAG 2.x). */
function luminancia([r, g, b]: [number, number, number]): number {
  const canal = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(fundo: string, texto: string): number {
  const a = luminancia(canais(fundo));
  const b = luminancia(canais(texto));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test.describe("Dark mode real", () => {
  test("toggle alterna a classe .dark e persiste no localStorage", async ({ page }) => {
    await page.addInitScript(iniciarTemaClaro);
    await page.goto("/");
    await esperarCards(page); // garante que o React hidratou antes do clique

    const html = page.locator("html");
    const botao = page.getByRole("button", { name: /Alternar tema/i });
    await expect(html).not.toHaveClass(/dark/);

    await botao.click();
    await expect(html).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("fiscal-tema"))).toBe("escuro");

    await page.reload();
    await expect(html).toHaveClass(/dark/);

    await botao.click();
    await expect(html).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("fiscal-tema"))).toBe("claro");
  });

  test("sem flash: o tema é aplicado antes do paint", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("fiscal-tema", "escuro"));
    await page.goto("/");

    await expect(page.locator("html")).toHaveClass(/dark/);
    const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(fundo).toBe("rgb(10, 20, 17)"); // --background do tema escuro
  });

  test("respeita a preferência do sistema quando não há preferência salva", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("botão de tema funciona por teclado", async ({ page }) => {
    await page.addInitScript(iniciarTemaClaro);
    await page.goto("/");
    await esperarCards(page);
    await page.getByRole("button", { name: /Alternar tema/i }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("status verde mantém contraste AA no claro e no escuro", async ({ page }) => {
    await page.addInitScript(iniciarTemaClaro);
    await page.goto("/?pauta=cesta_basica&cargo=SENADOR");
    await esperarCards(page);
    await expect(page.locator('[data-cargo-tab="SENADOR"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.getByLabel("Ordenar a lista").selectOption("melhores");
    const status = page.locator('[data-status-linha] span').first();
    await expect(status).toContainText(/Apoiou isenção/i);

    const medir = async () => {
      const cores = await status.evaluate((el) => {
        const estilo = getComputedStyle(el);
        return { fundo: estilo.backgroundColor, texto: estilo.color };
      });
      return contraste(cores.fundo, cores.texto);
    };

    expect(await medir()).toBeGreaterThanOrEqual(4.5);
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    expect(await medir()).toBeGreaterThanOrEqual(4.5);
  });
});



