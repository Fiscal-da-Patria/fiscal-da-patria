"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { COR_ALINHAMENTO, rotuloAlinhamento } from "@/lib/parlamentares";
import type { AlinhamentoVoto, ParlamentarConsolidado } from "@/types/parlamentar";

const ORDEM: AlinhamentoVoto[] = [
  "FAVORAVEL",
  "CONTRA",
  "ABSTENCAO",
  "AUSENTE",
  "NAO_APLICAVEL",
];

/** Quantos partidos aparecem antes de clicar em "ver todos". */
const LIMITE = 5;

interface LinhaPartido {
  partido: string;
  contagem: Record<AlinhamentoVoto, number>;
  total: number;
}

/**
 * "Como cada partido votou" na pauta ativa.
 *
 * Cada barra é a composição percentual dos votos **daquele partido**
 * (a favor / contra / abstenção / ausente / sem voto individual).
 *
 * Ordenação: **partidos com mais votos primeiro** (bancada maior no topo) e, no
 * **desempate**, quem mais votou **CONTRA o cidadão**.
 * Lista colapsada em 5 partidos, com "ver todos" (evita excesso de informação).
 */
export function GraficoPartidos({
  parlamentares,
  pautaSlug,
}: {
  parlamentares: ParlamentarConsolidado[];
  pautaSlug: string;
}) {
  const [expandido, setExpandido] = useState(false);
  const porPartido = new Map<string, Record<AlinhamentoVoto, number>>();

  for (const p of parlamentares) {
    const partido = p.partido?.trim() || "SEM PARTIDO";
    const acc =
      porPartido.get(partido) ??
      ({ FAVORAVEL: 0, CONTRA: 0, ABSTENCAO: 0, AUSENTE: 0, NAO_APLICAVEL: 0 } as Record<
        AlinhamentoVoto,
        number
      >);
    acc[p.votos[pautaSlug] ?? "AUSENTE"] += 1;
    porPartido.set(partido, acc);
  }

  const linhas: LinhaPartido[] = [...porPartido.entries()]
    .map(([partido, contagem]) => ({
      partido,
      contagem,
      total: ORDEM.reduce((s, k) => s + contagem[k], 0),
    }))
    .sort(
      (a, b) =>
        // 1º: partidos com mais votos (bancada maior ganha visibilidade)
        b.total - a.total ||
        // 2º: desempate → quem mais votou CONTRA o cidadão
        b.contagem.CONTRA - a.contagem.CONTRA ||
        a.partido.localeCompare(b.partido, "pt-BR"),
    );

  const totalGeral = linhas.reduce((s, l) => s + l.total, 0);
  const comVoto = linhas.reduce((s, l) => s + (l.total - l.contagem.NAO_APLICAVEL), 0);
  if (totalGeral === 0) return null;

  const visiveis = expandido ? linhas : linhas.slice(0, LIMITE);

  const pct = (n: number, base: number) => (base > 0 ? Math.round((n / base) * 100) : 0);

  return (
    <div
      data-testid="grafico-partidos"
      className="rounded-2xl border border-borda bg-superficie p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-titulo">Como cada partido votou</h3>
        <p className="text-[11px] text-corpo">
          {totalGeral} parlamentar(es) • maiores bancadas primeiro (desempate: quem{" "}
          {rotuloAlinhamento("CONTRA", pautaSlug).toLowerCase()})
        </p>
      </div>

      {comVoto === 0 && (
        <p
          data-grafico-vazio="1"
          className="mb-3 rounded-xl border border-dourado/40 bg-dourado/5 p-3 text-[11px] leading-relaxed text-corpo"
        >
          ⚠️ <strong className="text-titulo">Nenhum voto individual nesta casa para esta matéria</strong>{" "}
          — o Senado aprovou por votação simbólica, a matéria pode estar pendente na outra casa ou a
          sessão não registrou voto individual.
        </p>
      )}

      <ul className="space-y-3">
        {visiveis.map(({ partido, contagem, total }) => (
          <li key={partido}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-[11px]">
              <span className="font-bold text-titulo">{partido}</span>
              <span className="text-corpo">
                {contagem.CONTRA > 0 ? (
                  <strong className="font-bold text-contra-texto">
                    {pct(contagem.CONTRA, total)}% — {rotuloAlinhamento("CONTRA", pautaSlug)}
                  </strong>
                ) : (
                  <span className="font-medium">
                    Nenhum caso de “{rotuloAlinhamento("CONTRA", pautaSlug)}”
                  </span>
                )}
                <span className="text-corpo-fraco">
                  {" "}
                  • {total} ({pct(total, totalGeral)}% da Casa)
                </span>
              </span>
            </div>
            <div
              className="mt-1 flex h-3 w-full overflow-hidden rounded-full bg-trilha"
              role="img"
              aria-label={`${partido}: ${ORDEM.map((k) => `${rotuloAlinhamento(k, pautaSlug)} ${contagem[k]}`).join(", ")}`}
            >
              {ORDEM.map((k) =>
                contagem[k] > 0 ? (
                  <span
                    key={k}
                    className="h-full"
                    style={{
                      width: `${(contagem[k] / total) * 100}%`,
                      backgroundColor: COR_ALINHAMENTO[k],
                    }}
                    title={`${rotuloAlinhamento(k, pautaSlug)}: ${contagem[k]}`}
                  />
                ) : null,
              )}
            </div>
          </li>
        ))}
      </ul>

      {linhas.length > LIMITE && (
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          aria-expanded={expandido}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-borda bg-fundo-neutro px-3 py-2 text-[11px] font-bold text-titulo transition hover:border-dourado focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
        >
          {expandido ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden /> Mostrar menos partidos
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden /> Ver todos os {linhas.length}{" "}
              partidos
            </>
          )}
        </button>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-borda pt-3 text-[11px] text-corpo">
        {ORDEM.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COR_ALINHAMENTO[k] }}
            />
            {rotuloAlinhamento(k, pautaSlug)}
          </span>
        ))}
      </div>
    </div>
  );
}
