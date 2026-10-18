import { test, expect } from "@playwright/test";
import { esperarCards } from "./helpers";

const grupos = [
  { rotulo: "Os três Poderes da República", total: 3 },
  { rotulo: "Câmara e Senado", total: 2 },
  { rotulo: "A régua dos votos", total: 3 },
  { rotulo: "A linha do tempo de uma lei", total: 5 },
];

test.describe("Carrossel com dots — grupos curados", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("mostra os dots dos 4 grupos de /poderes e o ativo acompanha o toque", async ({ page }) => {
    await page.goto("/poderes");

    for (const grupo of grupos) {
      const nav = page.getByRole("group", {
        name: `Navegação do carrossel: ${grupo.rotulo}`,
      });
      await expect(nav.getByRole("button")).toHaveCount(grupo.total);
      await expect(nav.getByRole("button").first()).toHaveAttribute("aria-current", "true");
    }

    const nav = page.getByRole("group", {
      name: "Navegação do carrossel: Os três Poderes da República",
    });
    await nav.getByRole("button").nth(1).click();
    await expect(nav.getByRole("button").nth(1)).toHaveAttribute("aria-current", "true");
    await expect(nav.getByRole("button").first()).not.toHaveAttribute("aria-current", "true");
  });

  test("no desktop os dots somem e o grid continua", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/poderes");

    await expect(
      page.getByRole("group", {
        name: "Navegação do carrossel: Os três Poderes da República",
      }),
    ).toBeHidden();
    await expect(page.locator('[data-poder="legislativo"]').locator("xpath=..")).toHaveClass(
      /md:grid-cols-3/,
    );
  });

  test("compromissos do /sobre em carrossel no mobile", async ({ page }) => {
    await page.goto("/sobre");
    const nav = page.getByRole("group", {
      name: "Navegação do carrossel: Compromissos de Transparência",
    });
    await expect(nav.getByRole("button")).toHaveCount(3);

    await nav.getByRole("button").nth(2).click();
    await expect(nav.getByRole("button").nth(2)).toHaveAttribute("aria-current", "true");
  });

  test("overview da home: partido primeiro e hemiciclo depois", async ({ page }) => {
    await page.goto("/");
    await esperarCards(page);
    await page.locator("#graficos").scrollIntoViewIfNeeded();

    const nav = page.getByRole("group", {
      name: "Navegação do carrossel: Visão geral dos votos",
    });
    await expect(nav.getByRole("button")).toHaveCount(2);

    const grafico = await page.getByTestId("grafico-partidos").boundingBox();
    const hemi = await page.getByTestId("hemiciclo").boundingBox();
    expect(grafico).not.toBeNull();
    expect(hemi).not.toBeNull();
    expect(grafico?.x ?? 9_999).toBeLessThan(hemi?.x ?? 0);

    await nav.getByRole("button").nth(1).click();
    await expect(nav.getByRole("button").nth(1)).toHaveAttribute("aria-current", "true");
    const hemiBox = await page.getByTestId("hemiciclo").boundingBox();
    expect(hemiBox?.x ?? 999).toBeLessThan(390);
    expect(hemiBox?.x ?? -1).toBeGreaterThanOrEqual(0);
  });

  test("os carrosséis cabem em 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });

    for (const rota of ["/poderes", "/sobre"]) {
      await page.goto(rota);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${rota} não deve ter rolagem horizontal`).toBe(false);
    }
  });
});