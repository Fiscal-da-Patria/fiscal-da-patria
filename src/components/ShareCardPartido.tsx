"use client";

import { ShieldCheck } from "lucide-react";
import { COR_ALINHAMENTO, rotuloAlinhamento, textoDaCor } from "@/lib/parlamentares";
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
  const casa = pauta.casa === "SENADO" ? "Senado" : "Câmara";

  return (
    <div
      ref={ref}
      data-share-card="1"
      className="flex h-[375px] w-[300px] flex-col justify-between overflow-hidden rounded-2xl bg-verde-mata p-4 text-white shadow-xl"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-dourado">
          <ShieldCheck className="h-3.5 w-3.5" /> Votação na {casa}
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
          <p className="text-[26px] font-black leading-none text-white">{resumo.contagem}</p>
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
            <p className="mt-1 text-[9px] text-white/70">
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
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/15">
          {ORDEM_VOTOS.map((k) =>
            linha.contagem[k] > 0 ? (
              <span
                key={k}
                className="h-full"
                style={{
                  width: `${(linha.contagem[k] / linha.total) * 100}%`,
                  backgroundColor: COR_ALINHAMENTO[k],
                }}
              />
            ) : null,
          )}
        </div>
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
        <p className="text-[9px] font-bold text-dourado">fiscaldapatria.org.br</p>
      </div>
    </div>
  );
}
