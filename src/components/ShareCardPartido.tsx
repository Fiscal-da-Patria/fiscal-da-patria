"use client";

import { ShieldCheck } from "lucide-react";
import { BarraVotos } from "@/components/BarraVotos";
import {
  COR_ALINHAMENTO,
  COR_GRAFICO_CARTAO,
  rotuloAlinhamento,
  textoDaCor,
} from "@/lib/parlamentares";
import { SITE_HOST } from "@/lib/site";
import { ORDEM_VOTOS, resumoPartido, type LinhaPartido } from "@/lib/partidos";
import type { PautaConfig } from "@/types/parlamentar";

/**
 * A **imagem compartilhável de uma bancada** (1080×1350 — PNG 4:5).
 *
 * Mesma linguagem do cartão do parlamentar: matéria → partido + recorte →
 * manchete FACTUAL (contagem sobre quem tinha voto individual) → composição
 * da bancada → fonte oficial. Sem nota e sem juízo de valor.
 */
export function ShareCardPartido({
  linha,
  pauta,
  recorte,
  cargoLabel,
  ref,
}: {
  linha: LinhaPartido;
  pauta: PautaConfig;
  /** "Congresso Nacional" · "Senado Federal · UF: SP" */
  recorte: string;
  /** "deputados" · "senadores" · "parlamentares" */
  cargoLabel: string;
  ref: React.Ref<HTMLDivElement>;
}) {
  const resumo = resumoPartido(linha, pauta.slug);

  return (
    <div
      ref={ref}
      data-share-card="1"
      className="flex aspect-[4/5] w-[300px] max-w-full flex-col justify-between overflow-hidden rounded-2xl bg-verde-mata p-4 text-white shadow-xl"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-dourado">
          <ShieldCheck className="h-3.5 w-3.5" /> Votação nominal
        </span>
        <span className="rounded-full border border-white/20 px-1.5 py-0.5 text-[9px] text-white/70">
          Fiscal da Pátria
        </span>
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-dourado">
          {pauta.materia}
        </p>
        <h3 className="mt-1 text-[19px] font-black leading-tight">{pauta.rotuloPopular}</h3>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="max-w-[45%] shrink-0 truncate rounded-xl border-2 border-dourado bg-white/5 px-2.5 py-1.5 text-sm font-black text-dourado">
          {linha.partido}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-white/90">
            {linha.total} {cargoLabel}
          </p>
          <p className="text-[9px] leading-snug text-white/70">Recorte: {recorte}</p>
        </div>
      </div>

      {resumo ? (
        <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
          <p className="font-mono text-[26px] font-black leading-none text-white">{resumo.contagem}</p>
          <p
            className="mt-1 inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: resumo.destaque
                ? COR_ALINHAMENTO[resumo.destaque]
                : COR_ALINHAMENTO.ABSTENCAO,
              color: textoDaCor(resumo.destaque ?? "ABSTENCAO"),
            }}
          >
            {resumo.rotulo}
          </p>
          {!resumo.empate && (
            <p className="mt-1 font-mono text-[9px] text-white/70">
              {resumo.percentual}% de quem tinha voto individual
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
          <p className="text-[11px] font-bold text-white">Bancada sem votação nominal</p>
          <p className="mt-1 text-[9px] leading-snug text-white/70">
            A casa não registrou voto individual nesta matéria.
          </p>
        </div>
      )}

      <div>
        <BarraVotos
          contagem={linha.contagem}
          total={linha.total}
          cores={COR_GRAFICO_CARTAO}
          className="h-3 bg-white/15"
        />
        <p className="mt-1 text-[9px] leading-snug text-white/80">
          {ORDEM_VOTOS.filter((k) => linha.contagem[k] > 0)
            .map((k) => `${rotuloAlinhamento(k, pauta.slug)} ${linha.contagem[k]}`)
            .join(" · ")}
        </p>
      </div>

      <div className="border-t border-white/15 pt-2 text-center">
        <p className="text-[9px] text-white/80">
          Fonte oficial • {pauta.casa === "SENADO" ? "senado.leg.br" : "camara.leg.br"}
        </p>
        <p className="text-[9px] font-bold text-dourado">{SITE_HOST}</p>
      </div>
    </div>
  );
}
