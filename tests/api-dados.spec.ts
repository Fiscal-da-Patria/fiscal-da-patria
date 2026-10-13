import { test, expect } from "@playwright/test";
import { SLUGS, TOTAL_DEPUTADOS, TOTAL_PARLAMENTARES, TOTAL_SENADORES } from "./helpers";

interface Parlamentar {
  id: string;
  cargo: "DEPUTADO" | "SENADOR";
  urlPerfilOficial: string;
  fotoUrl: string;
  pontuacaoCivica: number;
  votos: Record<string, string>;
  votosOriginais?: Record<string, string>;
  motivos?: Record<string, string>;
}

test.describe("Dados servidos — integridade e anti-desinformação", () => {
  test("JSON consolidado está íntegro (Câmara + Senado)", async ({ request }) => {
    const res = await request.get("/data/parlamentares.json");
    expect(res.status()).toBe(200);

    const dados = (await res.json()) as Parlamentar[];
    expect(dados.length).toBe(TOTAL_PARLAMENTARES);
    expect(dados.filter((p) => p.cargo === "DEPUTADO").length).toBe(TOTAL_DEPUTADOS);
    expect(dados.filter((p) => p.cargo === "SENADOR").length).toBe(TOTAL_SENADORES);

    const slugsEsperados = [...SLUGS].sort();
    for (const p of dados) {
      expect(typeof p.id).toBe("string");
      expect(p.id.startsWith("camara-") || p.id.startsWith("senado-")).toBe(true);
      expect(p.urlPerfilOficial).toMatch(/^https:\/\/www(25)?\.(camara|senado)\.leg\.br\//);
      expect(p.fotoUrl).toMatch(
        p.cargo === "SENADOR"
          ? /^\/fotos\/sen-\d+\.jpg$/
          : /^(\/fotos\/\d+\.jpg|https?:\/\/.+)$/, // deputado pode cair no fallback remoto
      );
      expect(p.pontuacaoCivica).toBeGreaterThanOrEqual(0);
      expect(p.pontuacaoCivica).toBeLessThanOrEqual(100);
      expect(Object.keys(p.votos).sort()).toEqual(slugsEsperados); // matriz densa (10 pautas)
    }
  });

  test("inversão semântica da Blindagem está correta (SIM→CONTRA, NÃO→FAVORÁVEL)", async ({
    request,
  }) => {
    const dados = (await (await request.get("/data/parlamentares.json")).json()) as Parlamentar[];
    let sim = 0;
    let nao = 0;
    for (const p of dados) {
      const bruto = p.votosOriginais?.fim_blindagem;
      if (bruto === "SIM") {
        expect(p.votos.fim_blindagem).toBe("CONTRA");
        sim++;
      }
      if (bruto === "NAO") {
        expect(p.votos.fim_blindagem).toBe("FAVORAVEL");
        nao++;
      }
    }
    expect(sim).toBeGreaterThan(0);
    expect(nao).toBeGreaterThan(0);
  });

  test("senador traz voto real do Senado só onde houve votação nominal", async ({ request }) => {
    const dados = (await (await request.get("/data/parlamentares.json")).json()) as Parlamentar[];
    const senadores = dados.filter((p) => p.cargo === "SENADOR");

    // Pautas auditadas no Senado: todo senador tem voto individual ou um motivo explícito.
    for (const p of senadores) {
      for (const slug of ["aposentadoria_agentes_saude", "crime_organizado", "preco_energia"]) {
        const naoAplicavel = p.votos[slug] === "NAO_APLICAVEL";
        if (naoAplicavel) expect(p.motivos?.[slug]).toBeTruthy();
      }
    }

    // Pautas da Câmara aprovadas por votação SIMBÓLICA no Senado: nunca "AUSENTE".
    const simbolicas = ["igualdade_salarial", "piso_enfermagem", "teto_juro_cartao"];
    for (const p of senadores) {
      for (const slug of simbolicas) {
        expect(p.votos[slug]).toBe("NAO_APLICAVEL"); // nunca acusar falta de quem não votou
        expect(p.motivos?.[slug]).toMatch(/simbólica/i);
      }
    }

    // PEC 45/2019 teve votação nominal: existe pelo menos um voto registrado.
    expect(senadores.some((p) => p.votos.cesta_basica === "CONTRA")).toBe(true);
    expect(senadores.some((p) => p.votos.cesta_basica === "FAVORAVEL")).toBe(true);
  });

  test("fotos locais são servidas com o tipo correto", async ({ request }) => {
    const res = await request.get("/fotos/74646.jpg");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/jpeg");
  });

  test("rota inexistente retorna 404", async ({ request }) => {
    const res = await request.get("/rota-que-nao-existe");
    expect(res.status()).toBe(404);
  });
});
