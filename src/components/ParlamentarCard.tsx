import Image from "next/image";
import { ExternalLink, Share2 } from "lucide-react";
import { urlFonteOficial } from "@/lib/pautas";
import {
  COR_STATUS,
  TEXTO_STATUS,
  numeroCompacto,
  rotuloAlinhamento,
  rotuloCargo,
} from "@/lib/parlamentares";
import type { AlinhamentoVoto, PautaConfig, ParlamentarConsolidado } from "@/types/parlamentar";

/**
 * Card da listagem.
 *
 * Layout em 3 blocos de altura previsível — cabeçalho (foto + identidade),
 * status da pauta (uma linha, centralizada) e ações no rodapé (sempre na
 * mesma base). O `h-full` + `mt-auto` mantêm todos os cards da linha
 * alinhados, mesmo quando o nome ou o motivo têm tamanhos diferentes.
 */
export function ParlamentarCard({
  p,
  pauta,
  onCompartilhar,
  focado = false,
}: {
  p: ParlamentarConsolidado;
  pauta: PautaConfig;
  onCompartilhar: () => void;
  /** Veio de um deep link `?deputado=` — ganha destaque visual. */
  focado?: boolean;
}) {
  const pautaSel = pauta.slug;
  const alinhamento: AlinhamentoVoto = p.votos[pautaSel] ?? "AUSENTE";
  const bruto = p.votosOriginais?.[pautaSel];
  const motivo = p.motivos?.[pautaSel];

  return (
    <div
      data-nome={p.nome}
      data-focado={focado ? "1" : undefined}
      className={`flex h-full flex-col rounded-2xl border bg-superficie p-3 shadow-sm transition hover:shadow-md sm:p-4 ${
        focado ? "border-2 border-dourado ring-2 ring-dourado/25" : "border-borda"
      }`}
    >
      {/* Cabeçalho: foto + nome + votos de urna + cargo/partido (1 linha) */}
      <div className="flex items-start gap-3">
        <Image
          src={p.fotoUrl}
          alt={p.nome}
          width={48}
          height={48}
          unoptimized
          className="h-12 w-12 shrink-0 rounded-full border border-borda object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-2 min-w-0 text-sm font-bold leading-snug text-titulo">{p.nome}</h3>
            {p.votosEleicao > 0 && (
              <span
                data-votos={p.votosEleicao}
                title={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas (TSE)`}
                aria-label={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas (TSE)`}
                className="shrink-0 rounded-md border border-dourado/60 bg-dourado/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-titulo"
              >
                🗳️ {numeroCompacto(p.votosEleicao)}
              </span>
            )}
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <span
              className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold ${
                p.cargo === "SENADOR"
                  ? "border border-dourado/60 bg-dourado/15 text-titulo"
                  : "border border-verde-bandeira/40 bg-verde-bandeira/10 text-titulo"
              }`}
              data-cargo={p.cargo}
            >
              {rotuloCargo(p.cargo)} • {p.uf}
            </span>
            <span className="truncate text-[11px] text-corpo">{p.partido}</span>
          </div>
        </div>
      </div>

      {/*
        Status da pauta ativa: faixa horizontal de largura total (o “aprovou
        ou não”). A altura mínima reserva o espaço do motivo nos cards que o
        têm, para o bloco de ações começar na mesma altura em todos os cards.
      */}
      <div
        data-status-linha="1"
        className="mt-3 flex min-h-12 flex-col items-center justify-center gap-1 text-center"
      >
        <span
          className="flex w-full items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-bold"
          style={{
            backgroundColor: COR_STATUS[alinhamento],
            color: TEXTO_STATUS[alinhamento],
          }}
        >
          {rotuloAlinhamento(alinhamento, pautaSel)}
        </span>
        {!bruto && motivo && (
          <p className="line-clamp-2 text-[10px] leading-tight text-corpo" title={motivo}>
            {motivo}
          </p>
        )}
      </div>

      {/* Ações sempre na base do card (mesma linha em toda a grade) */}
      <div data-acoes-card="1" className="mt-auto grid grid-cols-2 gap-2 pt-2">
        <a
          href={urlFonteOficial(pauta)}
          target="_blank"
          rel="noreferrer"
          data-fonte-card={pauta.slug}
          title={`${pauta.materia} — fonte oficial`}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-borda py-2 text-[11px] font-semibold text-corpo transition hover:border-dourado hover:text-titulo"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Fonte oficial
        </a>
        <button
          type="button"
          onClick={onCompartilhar}
          data-compartilhar-card="1"
          aria-label={`Compartilhar o voto de ${p.nome} em ${pauta.materia}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-verde-mata py-2 text-[11px] font-bold text-white transition hover:bg-verde-bandeira"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden /> Compartilhar
        </button>
      </div>
    </div>
  );
}

