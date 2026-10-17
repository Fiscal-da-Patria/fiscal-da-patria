"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { COR_ALINHAMENTO, rotuloAlinhamento } from "@/lib/parlamentares";
import { ORDEM_VOTOS, agregarPorPartido, type LinhaPartido } from "@/lib/partidos";
import type { ParlamentarConsolidado } from "@/types/parlamentar";

/** Quantos partidos aparecem antes de clicar em "ver todos". */
const LIMITE = 5;

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
  onCompartilhar,
}: {
  parlamentares: ParlamentarConsolidado[];
  pautaSlug: string;
  /** Abre o cartão compartilhável da bancada (opcional). */
  onCompartilhar?: (linha: LinhaPartido) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  // Fonte única: a mesma função gera a manchete do cartão por partido.
  const linhas = agregarPorPartido(parlamentares, pautaSlug);

  const totalGeral = linhas.reduce((s, l) => s + l.total, 0);
  const comVoto = linhas.reduce((s, l) => s + (l.total - l.contagem.NAO_APLICAVEL), 0);

  // Lista vazia (a casa filtrada não votou a matéria): mostramos o estado vazio
  // em vez de sumir com o bloco — o usuário precisa saber por que não há barras.
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
        {visiveis.map(({ partido, contagem, total, comVoto }) => (
          <li key={partido}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-[11px]">
              <span className="flex items-center gap-1.5 font-bold text-titulo">
                {partido}
                {onCompartilhar && (
                  <button
                    type="button"
                    onClick={() => onCompartilhar({ partido, contagem, total, comVoto })}
                    data-compartilhar-partido={partido}
                    aria-label={`Compartilhar o cartão do ${partido} nesta matéria`}
                    title={`Compartilhar como o ${partido} votou`}
                    className="rounded-md border border-borda p-1 text-corpo transition hover:border-dourado hover:text-titulo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
                  >
                    <Share2 className="h-3 w-3" aria-hidden />
                  </button>
                )}
              </span>
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
              aria-label={`${partido}: ${ORDEM_VOTOS.map((k) => `${rotuloAlinhamento(k, pautaSlug)} ${contagem[k]}`).join(", ")}`}
            >
              {ORDEM_VOTOS.map((k) =>
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
        {ORDEM_VOTOS.map((k) => (
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
