import { test, expect } from "@playwright/test";
import { esperarCards } from "./helpers";

/** Define o tema claro só se não houver preferência salva (não sobrescreve no reload). */
function iniciarTemaClaro() {
  if (!localStorage.getItem("fiscal-tema")) localStorage.setItem("fiscal-tema", "claro");
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
});



