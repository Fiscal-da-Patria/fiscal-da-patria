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
