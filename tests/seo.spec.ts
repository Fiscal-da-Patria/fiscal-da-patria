import { test, expect, type Page } from "@playwright/test";

/** Lê o atributo `content` de uma meta tag (por `name` ou `property`). */
async function meta(page: Page, attr: "name" | "property", chave: string) {
  return await page.locator(`meta[${attr}="${chave}"]`).first().getAttribute("content");
}

test.describe("Card de compartilhamento (OpenGraph / X)", () => {
  test("o WhatsApp encontra título, descrição e imagem absoluta", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Fiscal da Pátria/);

    expect(await meta(page, "property", "og:type")).toBe("website");
    expect(await meta(page, "property", "og:site_name")).toBe("Fiscal da Pátria");
    expect(await meta(page, "property", "og:locale")).toBe("pt_BR");
    expect(await meta(page, "property", "og:title")).toMatch(/Fiscal da Pátria/);
    expect(await meta(page, "property", "og:description")).toMatch(/prato de comida/i);

    // URL ABSOLUTA: sem isso o crawler não consegue montar a miniatura.
    expect(await meta(page, "property", "og:image")).toBe(
      "https://fiscaldapatria.org.br/og-image.png",
    );
    expect(await meta(page, "property", "og:image:width")).toBe("1200");
    expect(await meta(page, "property", "og:image:height")).toBe("630");
    expect(await meta(page, "property", "og:image:alt")).toMatch(/blindagem de políticos/i);
  });

  test("X/Twitter usa cartão de imagem grande", async ({ page }) => {
    await page.goto("/");
    expect(await meta(page, "name", "twitter:card")).toBe("summary_large_image");
    expect(await meta(page, "name", "twitter:image")).toBe(
      "https://fiscaldapatria.org.br/og-image.png",
    );
  });

  test("a página /sobre também tem card OpenGraph", async ({ page }) => {
    await page.goto("/sobre");
    expect(await meta(page, "property", "og:image")).toBe(
      "https://fiscaldapatria.org.br/og-image.png",
    );
  });
});

test.describe("Ícones, favicon e PWA", () => {
  test("HTML declara favicon, apple-touch-icon, manifest e theme-color", async ({ page }) => {
    await page.goto("/");
    expect(
      await page.locator('link[rel="icon"]').first().getAttribute("href"),
    ).toMatch(/favicon\.ico/);
    expect(
      await page.locator('link[rel="apple-touch-icon"]').first().getAttribute("href"),
    ).toMatch(/apple-touch-icon\.png/);
    expect(await page.locator('link[rel="manifest"]').getAttribute("href")).toBe(
      "/manifest.webmanifest",
    );
    expect(await meta(page, "name", "theme-color")).toBe("#0f2f1d");
  });

  test("os arquivos existem e são servidos com o tipo certo", async ({ request }) => {
    const ativos: Array<[string, string]> = [
      ["/og-image.png", "image/png"],
      ["/apple-touch-icon.png", "image/png"],
      ["/icon-192.png", "image/png"],
      ["/icon-512.png", "image/png"],
      ["/favicon.ico", "image"],
    ];
    for (const [rota, tipo] of ativos) {
      const r = await request.get(rota);
      expect(r.status(), rota).toBe(200);
      expect(r.headers()["content-type"], rota).toContain(tipo);
    }
  });

  test("manifest é JSON válido com ícones 192 e 512", async ({ request }) => {
    const r = await request.get("/manifest.webmanifest");
    expect(r.status()).toBe(200);
    const m = (await r.json()) as {
      name: string;
      display: string;
      icons: Array<{ sizes: string }>;
    };
    expect(m.name).toBe("Fiscal da Pátria");
    expect(m.display).toBe("standalone");
    expect(m.icons.map((i) => i.sizes)).toEqual(["192x192", "512x512"]);
  });
});

test.describe("Rodapé jurídico (isenção e compliance)", () => {
  for (const rota of ["/", "/sobre"]) {
    test(`declaração de isenção visível em ${rota}`, async ({ page }) => {
      await page.goto(rota);
      const legal = page.locator("footer").getByText(/iniciativa cívica voluntária/i);
      await expect(legal).toBeVisible();
      await expect(legal).toContainText(
        /não possuímos vínculo com partidos políticos, candidatos ou órgãos estatais/i,
      );
      await expect(legal).toContainText(/Lei de Acesso à Informação \(Lei 12\.527\/2011\)/i);
      await expect(legal).toContainText(/dadosabertos\.camara\.leg\.br/i);
      await expect(legal).toContainText(/sem fins lucrativos/i);
    });
  }
});
