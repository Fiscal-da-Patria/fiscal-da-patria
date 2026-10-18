import { test } from "@playwright/test";
import fs from "node:fs";
import { esperarCards } from "./helpers";

const DIR = "playwright-shots";
fs.mkdirSync(DIR, { recursive: true });

test("capturas visuais — desktop", async ({ page }) => {
  await page.goto("/");
  await esperarCards(page);
  await page.screenshot({ path: `${DIR}/home-desktop.png`, fullPage: true });

  await page.goto("/sobre");
  await page.screenshot({ path: `${DIR}/sobre-desktop.png`, fullPage: true });
});

test("captura visual — cartão compartilhável do top 5", async ({ page }) => {
  await page.goto("/");
  await esperarCards(page);
  await page.locator("[data-compartilhar-top5]").click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("dialog").screenshot({ path: `${DIR}/share-top5.png` });
});

test("captura visual — /poderes mobile com carrossel", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  await page.goto("/poderes");
  await page.screenshot({ path: `${DIR}/poderes-mobile.png`, fullPage: true });

  const dots = page.getByRole("group", {
    name: "Navegação do carrossel: Os três Poderes da República",
  });
  await dots.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${DIR}/poderes-carrossel.png` });

  await context.close();
});

test("capturas visuais — tema escuro", async ({ page }) => {
  await page.goto("/");
  await esperarCards(page);
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.screenshot({ path: `${DIR}/home-dark.png`, fullPage: true });
});

test("capturas visuais — mobile 390x844", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  await page.goto("/");
  await esperarCards(page);
  await page.screenshot({ path: `${DIR}/home-mobile.png`, fullPage: true });

  await page.goto("/sobre");
  await page.screenshot({ path: `${DIR}/sobre-mobile.png`, fullPage: true });

  await context.close();
});
