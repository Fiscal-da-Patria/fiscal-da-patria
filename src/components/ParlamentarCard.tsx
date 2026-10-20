import Image from "next/image";
import { ExternalLink, Share2 } from "lucide-react";
import { urlFonteOficial } from "@/lib/pautas";
import {
  COR_STATUS,
  ROTULO_VOTO_BRUTO,
  TEXTO_STATUS,
  numeroCompacto,
  rotuloAlinhamento,
  rotuloCargo,
} from "@/lib/parlamentares";
import type { AlinhamentoVoto, PautaConfig, ParlamentarConsolidado } from "@/types/parlamentar";

/**
 * Card da listagem.
 *
 * No celular, vira uma linha compacta: foto + identidade à esquerda, ações em
 * ícones à direita e status como chip. No desktop (`sm:`), mantém os 3 blocos
 * de altura previsível — cabeçalho, faixa de status e ações na base — para
 * alinhar a grade. O `h-full` + `mt-auto` preservam essa base comum.
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
  const votoBruto =
    bruto === "SIM" || bruto === "NAO" || bruto === "ABSTENCAO"
      ? ROTULO_VOTO_BRUTO[bruto]
      : null;
  const anoEleicao = p.anoEleicao ? ` em ${p.anoEleicao}` : "";

  return (
    <div
      data-nome={p.nome}
      data-focado={focado ? "1" : undefined}
      className={`relative flex h-full flex-col rounded-2xl border bg-superficie p-3 pr-12 shadow-sm transition hover:shadow-md sm:p-4 sm:pr-4 ${
        focado ? "border-2 border-dourado ring-2 ring-dourado/25" : "border-borda"
      }`}
    >
      {/* Cabeçalho: foto + nome + cargo/partido */}
      <div className="flex items-start gap-3">
        <Image
          src={p.fotoUrl}
          alt={p.nome}
          width={48}
          height={48}
          unoptimized
          className="h-11 w-11 shrink-0 rounded-full border border-borda object-cover sm:h-12 sm:w-12"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="line-clamp-2 min-w-0 text-sm font-bold leading-snug text-titulo">{p.nome}</h3>
            {p.votosEleicao > 0 && (
              <span
                data-votos={p.votosEleicao}
                title={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas${anoEleicao} (TSE)`}
                aria-label={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas${anoEleicao} (TSE)`}
                className="hidden shrink-0 items-center rounded-md border border-dourado/60 bg-dourado/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-titulo sm:inline-flex"
              >
                🗳️ {numeroCompacto(p.votosEleicao)} votos
              </span>
            )}
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <span
              className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-bold ${
                p.cargo === "SENADOR"
                  ? "border border-dourado/60 bg-dourado/15 text-titulo"
                  : "border border-tag-verde-borda bg-tag-verde-fundo text-titulo"
              }`}
              data-cargo={p.cargo}
            >
              {rotuloCargo(p.cargo)} • {p.uf}
            </span>
            <span data-partido="1" className="truncate text-xs font-bold text-corpo">
              {p.partido}
            </span>
          </div>
        </div>
      </div>

      {/*
        Status: chip compacto no celular; faixa de largura total no desktop.
        A altura mínima do desktop reserva o motivo para alinhar as ações.
      */}
      <div
        data-status-linha="1"
        className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:min-h-12 sm:flex-col sm:items-center sm:justify-center sm:gap-1 sm:text-center"
      >
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold sm:w-full sm:justify-center sm:rounded-md sm:px-3 sm:py-1.5 sm:text-[11px]"
          style={{
            backgroundColor: COR_STATUS[alinhamento],
            color: TEXTO_STATUS[alinhamento],
          }}
        >
          {rotuloAlinhamento(alinhamento, pautaSel)}
          {votoBruto && (
            <span className="rounded bg-black/15 px-1 font-mono text-[9px] uppercase tracking-wide">
              {votoBruto}
            </span>
          )}
        </span>
        {p.votosEleicao > 0 && (
          <span className="font-mono text-[11px] font-semibold text-corpo sm:hidden">
            🗳️ {numeroCompacto(p.votosEleicao)} votos
          </span>
        )}
        {!bruto && motivo && (
          <p
            className="line-clamp-1 w-full text-xs leading-tight text-corpo sm:line-clamp-2 sm:text-[11px]"
            title={motivo}
          >
            {motivo}
          </p>
        )}
      </div>

      {/* Ações: ícones à direita no celular; rodapé em 2 colunas no desktop. */}
      <div
        data-acoes-card="1"
        className="absolute right-3 top-3 flex flex-col gap-1 sm:static sm:mt-auto sm:grid sm:grid-cols-2 sm:gap-2 sm:pt-2"
      >
        <a
          href={urlFonteOficial(pauta)}
          target="_blank"
          rel="noreferrer"
          data-fonte-card={pauta.slug}
          title={`${pauta.materia} — fonte oficial`}
          aria-label={`Fonte oficial — ${pauta.materia}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-borda text-corpo transition hover:border-dourado hover:text-titulo sm:h-auto sm:w-auto sm:gap-1 sm:py-2 sm:text-[11px] sm:font-semibold"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Fonte oficial</span>
        </a>
        <button
          type="button"
          onClick={onCompartilhar}
          data-compartilhar-card="1"
          aria-label={`Compartilhar o voto de ${p.nome} em ${pauta.materia}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-verde-mata text-white transition hover:bg-verde-bandeira sm:h-auto sm:w-auto sm:gap-1.5 sm:py-2 sm:text-[11px] sm:font-bold"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Compartilhar</span>
        </button>
      </div>
    </div>
  );
}