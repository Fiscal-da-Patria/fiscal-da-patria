"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import {
  COR_ALINHAMENTO,
  ROTULO_VOTO_BRUTO,
  iniciais,
  rotuloAlinhamento,
  rotuloCargo,
  textoDaCor,
} from "@/lib/parlamentares";
import { exemploPratico } from "@/lib/pautas";
import type { AlinhamentoVoto, PautaConfig, ParlamentarConsolidado } from "@/types/parlamentar";

/**
 * A **imagem** compartilhável (1080×1350 — PNG 4:5), pensada para o Zap:
 *
 *   matéria (PEC/PL) → o que muda no dia a dia → quem votou → como votou →
 *   fonte oficial no rodapé.
 *
 * É um componente puro de apresentação: quem exporta é o `ShareModal`, que segura
 * a `ref` e chama o `html-to-image` (o botão de exportar fica FORA do card, para
 * não aparecer na imagem).
 */
export function ShareCard({
  parlamentar,
  pauta,
  ref,
}: {
  parlamentar: ParlamentarConsolidado;
  pauta: PautaConfig;
  ref: React.Ref<HTMLDivElement>;
}) {
  const alinhamento: AlinhamentoVoto = parlamentar.votos[pauta.slug] ?? "AUSENTE";
  const bruto = parlamentar.votosOriginais?.[pauta.slug];
  const motivo = parlamentar.motivos?.[pauta.slug];
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
        <h3 className="mt-1 text-[21px] font-black leading-tight">{pauta.rotuloPopular}</h3>
        <p className="mt-2 line-clamp-2 rounded-lg bg-white/10 px-2 py-1 text-[10px] leading-snug text-white">
          <strong className="text-dourado">No dia a dia:</strong> {exemploPratico(pauta)}
        </p>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5">
        {parlamentar.fotoUrl.startsWith("/fotos/") ? (
          <Image
            src={parlamentar.fotoUrl}
            alt={parlamentar.nome}
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 shrink-0 rounded-full border-2 border-dourado object-cover"
          />
        ) : (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-dourado bg-verde-bandeira text-base font-black text-dourado">
            {iniciais(parlamentar.nome)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{parlamentar.nome}</p>
          <p className="text-[10px] text-white/80">
            {rotuloCargo(parlamentar.cargo)} • {parlamentar.partido}-{parlamentar.uf}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl px-3 py-2 text-center"
        style={{ backgroundColor: COR_ALINHAMENTO[alinhamento], color: textoDaCor(alinhamento) }}
      >
        <p className="text-lg font-black leading-tight">
          {rotuloAlinhamento(alinhamento, pauta.slug)}
        </p>
        {bruto && alinhamento !== "NAO_APLICAVEL" && (
          <p className="text-[10px] font-bold opacity-90">
            Voto registrado: {ROTULO_VOTO_BRUTO[bruto]}
          </p>
        )}
        {!bruto && motivo && <p className="text-[9px] leading-snug opacity-90">{motivo}</p>}
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
