import { test, expect } from "@playwright/test";
import { agregarPorPartido, resumoPartido } from "../src/lib/partidos";
import type { AlinhamentoVoto, ParlamentarConsolidado } from "../src/types/parlamentar";

const SLUG = "cesta_basica";

/** Parlamentar sintético com um voto na pauta. */
function fake(nome: string, partido: string, voto: AlinhamentoVoto): ParlamentarConsolidado {
  return {
    id: `camara-${nome}`,
    cargo: "DEPUTADO",
    nome,
    partido,
    uf: "RJ",
    fotoUrl: "/fotos/x.jpg",
    urlPerfilOficial: "https://www.camara.leg.br/deputados/1",
    votosEleicao: 0,
    votos: { [SLUG]: voto },
  };
}

test.describe("Agregação por partido — gráfico e cartão", () => {
  test("conta por bancada, separa 'sem voto individual' e ordena pela maior", () => {
    const linhas = agregarPorPartido(
      [
        fake("A", "PL", "CONTRA"),
        fake("B", "PL", "CONTRA"),
        fake("C", "PL", "FAVORAVEL"),
        fake("D", "PT", "FAVORAVEL"),
        fake("E", "PT", "FAVORAVEL"),
        fake("F", "PT", "ABSTENCAO"),
        fake("G", "PSDB", "NAO_APLICAVEL"),
      ],
      SLUG,
    );

    expect(linhas.map((l) => l.partido)).toEqual(["PL", "PT", "PSDB"]);
    const pl = linhas[0];
    expect(pl.total).toBe(3);
    expect(pl.comVoto).toBe(3);
    expect(pl.contagem.CONTRA).toBe(2);
    expect(pl.contagem.FAVORAVEL).toBe(1);

    // Partido sem votação nominal: total conta, comVoto não.
    const psdb = linhas[2];
    expect(psdb.total).toBe(1);
    expect(psdb.comVoto).toBe(0);
  });

  test("desempate: quem mais votou contra a proposta vem primeiro", () => {
    const linhas = agregarPorPartido(
      [fake("A", "AAA", "FAVORAVEL"), fake("B", "BBB", "CONTRA")],
      SLUG,
    );
    expect(linhas.map((l) => l.partido)).toEqual(["BBB", "AAA"]);
  });

  test("manchete factual: 'X de N' sobre quem tinha voto individual", () => {
    const [pl] = agregarPorPartido(
      [
        fake("A", "PL", "CONTRA"),
        fake("B", "PL", "CONTRA"),
        fake("C", "PL", "CONTRA"),
        fake("D", "PL", "FAVORAVEL"),
        fake("E", "PL", "NAO_APLICAVEL"),
        fake("F", "PL", "NAO_APLICAVEL"),
      ],
      SLUG,
    );

    expect(pl.total).toBe(6);
    expect(pl.comVoto).toBe(4);

    const resumo = resumoPartido(pl, SLUG);
    expect(resumo).not.toBeNull();
    expect(resumo!.destaque).toBe("CONTRA");
    expect(resumo!.rotulo).toBe("Rejeitou isenção");
    expect(resumo!.contagem).toBe("3 de 4");
    expect(resumo!.percentual).toBe(75);
    expect(resumo!.empate).toBe(false);
  });

  test("empate não escolhe lado", () => {
    const [linha] = agregarPorPartido(
      [fake("A", "PL", "CONTRA"), fake("B", "PL", "FAVORAVEL")],
      SLUG,
    );
    const resumo = resumoPartido(linha, SLUG);
    expect(resumo!.destaque).toBeNull();
    expect(resumo!.empate).toBe(true);
    expect(resumo!.rotulo).toBe("Empate");
  });

  test("bancada sem votação nominal não gera manchete", () => {
    const [linha] = agregarPorPartido([fake("A", "PSDB", "NAO_APLICAVEL")], SLUG);
    expect(resumoPartido(linha, SLUG)).toBeNull();
  });
});
