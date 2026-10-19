"use client";

import { ShieldCheck } from "lucide-react";
import { BarraVotos } from "@/components/BarraVotos";
import { COR_GRAFICO_CARTAO, rotuloAlinhamento } from "@/lib/parlamentares";
import { SITE_HOST } from "@/lib/site";
import { ORDEM_VOTOS, TOP_BANCADAS, resumoPartido, type LinhaPartido } from "@/lib/partidos";
import type { PautaConfig } from "@/types/parlamentar";

/**
 * A **imagem compartilhável do top 5 de bancadas** (1080×1350 — PNG 4:5).
 *
 * Mesmo recorte da lista "Como cada partido votou": as 5 maiores bancadas
 * (desempate: quem mais votou contra), cada uma com a manchete FACTUAL
 * "X de N" sobre quem tinha voto individual e a composição do voto.
 * Sem nota e sem juízo de valor.
 */
export function ShareCardTop5({
  linhas,
  pauta,
  recorte,
  ref,
}: {
  linhas: LinhaPartido[];
  pauta: PautaConfig;
  /** "Congresso Nacional" · "Senado Federal · UF: SP" */
  recorte: string;
  ref: React.Ref<HTMLDivElement>;
}) {
  const top = linhas.slice(0, TOP_BANCADAS);

  return (
    <div
      ref={ref}
      data-share-card="1"
      data-share-card-top5="1"
      className="flex aspect-[4/5] w-[300px] max-w-full flex-col overflow-hidden rounded-2xl bg-verde-mata p-3 text-white shadow-xl max-[359px]:p-2.5"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-dourado">
          <ShieldCheck className="h-3.5 w-3.5" /> Votação nominal
        </span>
        <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70">
          Fiscal da Pátria
        </span>
      </div>

      <div className="mt-1.5 max-[359px]:mt-1">
        <p className="text-[11px] font-black uppercase tracking-wider text-dourado">
          {pauta.materia}
        </p>
        <h3 className="mt-0.5 text-[16px] font-black leading-tight">{pauta.rotuloPopular}</h3>
        <p className="mt-0.5 line-clamp-2 text-[8px] leading-snug text-white/70">
          Top {top.length} bancadas · Recorte: {recorte}
        </p>
      </div>

      <ul className="mt-1.5 flex flex-1 flex-col justify-between gap-1 max-[359px]:mt-1 max-[359px]:gap-0.5">
        {top.map((linha) => {
          const resumo = resumoPartido(linha, pauta.slug);
          return (
            <li
              key={linha.partido}
              className="rounded-lg bg-white/5 px-2 py-0.5 max-[359px]:py-0"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-black text-dourado">{linha.partido}</span>
                <span className="shrink-0 font-mono text-[9px] font-bold text-white/90">
                  {resumo ? resumo.contagem : `${linha.total} sem voto`}
                </span>
              </div>
              <p className="truncate text-[8px] leading-tight text-white/70">
                {resumo ? resumo.rotulo : "Sem votação nominal nesta casa"}
              </p>
              <BarraVotos
                contagem={linha.contagem}
                total={linha.total}
                cores={COR_GRAFICO_CARTAO}
                className="mt-0.5 h-1 bg-white/15"
                rotulo={`${linha.partido}: ${ORDEM_VOTOS.map(
                  (k) => `${rotuloAlinhamento(k, pauta.slug)} ${linha.contagem[k]}`,
                ).join(", ")}`}
              />
            </li>
          );
        })}
      </ul>

      <p className="mt-1 text-center text-[8px] leading-tight text-white/60 max-[359px]:mt-0.5">
        N = parlamentares com voto individual registrado
      </p>

      <div className="mt-1 border-t border-white/15 pt-1.5 text-center max-[359px]:pt-1">
        <p className="text-[8px] text-white/80">
          Fonte oficial • {pauta.casa === "SENADO" ? "senado.leg.br" : "camara.leg.br"} ·{" "}
          <span className="font-bold text-dourado">{SITE_HOST}</span>
        </p>
      </div>
    </div>
  );
}
