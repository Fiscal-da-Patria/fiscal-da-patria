import { test, expect, type Page } from "@playwright/test";
import { SITE_URL } from "../src/lib/site";

/** Lê o atributo `content` de uma meta tag (por `name` ou `property`). */
async function meta(page: Page, attr: "name" | "property", chave: string) {
  return await page.locator(`meta[${attr}="${chave}"]`).first().getAttribute("content");
}

test.describe("Card de compartilhamento (OpenGraph / X)", () => {
  test("o domínio canônico do projeto é fiscaldapatria.org", () => {
    expect(SITE_URL).toBe("https://fiscaldapatria.org");
  });

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
      `${SITE_URL}/og-image.png`,
    );
    expect(await meta(page, "property", "og:image:width")).toBe("1200");
    expect(await meta(page, "property", "og:image:height")).toBe("630");
    expect(await meta(page, "property", "og:image:alt")).toMatch(/blindagem de políticos/i);
  });

  test("X/Twitter usa cartão de imagem grande", async ({ page }) => {
    await page.goto("/");
    expect(await meta(page, "name", "twitter:card")).toBe("summary_large_image");
    expect(await meta(page, "name", "twitter:image")).toBe(
      `${SITE_URL}/og-image.png`,
    );
  });

  test("a página /sobre também tem card OpenGraph", async ({ page }) => {
    await page.goto("/sobre");
    expect(await meta(page, "property", "og:image")).toBe(
      `${SITE_URL}/og-image.png`,
    );
  });
});

test.describe("Canonical e indexação", () => {
  test("canonical aponta para a URL oficial de cada página", async ({ page }) => {
    const rotas: Array<[string, RegExp]> = [
      ["/", new RegExp(`^${SITE_URL.replace(/\./g, "\\.")}/?$`)],
      ["/sobre", new RegExp(`^${SITE_URL.replace(/\./g, "\\.")}/sobre$`)],
      ["/poderes", new RegExp(`^${SITE_URL.replace(/\./g, "\\.")}/poderes$`)],
    ];
    for (const [rota, esperado] of rotas) {
      await page.goto(rota);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", esperado);
    }
  });

  test("robots.txt libera o site e aponta o sitemap", async ({ request }) => {
    const r = await request.get("/robots.txt");
    expect(r.status()).toBe(200);
    const texto = await r.text();
    expect(texto).toMatch(/User-Agent:\s*\*/i);
    expect(texto).toMatch(/Allow:\s*\//i);
    expect(texto).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test("sitemap.xml lista as páginas públicas", async ({ request }) => {
    const r = await request.get("/sitemap.xml");
    expect(r.status()).toBe(200);
    const xml = await r.text();
    expect(xml).toContain(`<loc>${SITE_URL}`);
    expect(xml).toContain(`${SITE_URL}/sobre`);
    expect(xml).toContain(`${SITE_URL}/poderes`);
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
