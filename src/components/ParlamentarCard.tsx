import Image from "next/image";
import { ExternalLink, Share2 } from "lucide-react";
import { PAUTAS, urlFonteOficial } from "@/lib/pautas";
import {
  COR_ALINHAMENTO,
  numeroCompacto,
  rotuloAlinhamento,
  rotuloCargo,
  textoDaCor,
} from "@/lib/parlamentares";
import type { AlinhamentoVoto, PautaConfig, ParlamentarConsolidado } from "@/types/parlamentar";

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
      className={`flex flex-col justify-between rounded-2xl border bg-superficie p-4 shadow-sm transition hover:shadow-md ${
        focado ? "border-2 border-dourado ring-2 ring-dourado/25" : "border-borda"
      }`}
    >
      <div>
        <div className="mb-3 flex items-center gap-3">
          <Image
            src={p.fotoUrl}
            alt={p.nome}
            width={48}
            height={48}
            unoptimized
            className="h-12 w-12 rounded-full border border-borda object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="min-w-0 truncate text-sm font-bold text-titulo">{p.nome}</h3>
              {p.votosEleicao > 0 && (
                <span
                  data-votos={p.votosEleicao}
                  title={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas (TSE)`}
                  aria-label={`${p.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas (TSE)`}
                  className="shrink-0 rounded-md border border-dourado/60 bg-dourado/15 px-1.5 py-0.5 text-[10px] font-bold text-titulo"
                >
                  🗳️ {numeroCompacto(p.votosEleicao)}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  p.cargo === "SENADOR"
                    ? "border border-dourado/60 bg-dourado/15 text-titulo"
                    : "border border-verde-bandeira/40 bg-verde-bandeira/10 text-titulo"
                }`}
                data-cargo={p.cargo}
              >
                {rotuloCargo(p.cargo)} • {p.uf}
              </span>
              <span className="text-xs text-corpo">{p.partido}</span>
            </div>
          </div>
        </div>

        <div className="mb-2 flex gap-1" aria-hidden>
          {PAUTAS.map((pauta) => {
            const ativa = pauta.slug === pautaSel;
            return (
              <span
                key={pauta.slug}
                className={
                  ativa
                    ? "h-2.5 flex-1 rounded-full ring-1 ring-dourado"
                    : "h-1.5 flex-1 rounded-full"
                }
                style={{ backgroundColor: COR_ALINHAMENTO[p.votos[pauta.slug] ?? "AUSENTE"] }}
              />
            );
          })}
        </div>

        <div className="mb-3">
          <span
            className="inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold"
            style={{
              backgroundColor: COR_ALINHAMENTO[alinhamento],
              color: textoDaCor(alinhamento),
            }}
          >
            {rotuloAlinhamento(alinhamento, pautaSel)}
          </span>
          {!bruto && motivo && (
            <p className="mt-1 text-[10px] leading-snug text-corpo" title={motivo}>
              {motivo}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={urlFonteOficial(pauta)}
          target="_blank"
          rel="noreferrer"
          data-fonte-card={pauta.slug}
          title={`${pauta.materia} — fonte oficial`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-borda py-2 text-[11px] font-semibold text-corpo transition hover:border-dourado hover:text-titulo"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Fonte oficial
        </a>
        <button
          type="button"
          onClick={onCompartilhar}
          data-compartilhar-card="1"
          aria-label={`Compartilhar o voto de ${p.nome} em ${pauta.materia}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-verde-mata py-2 text-[11px] font-bold text-white transition hover:bg-verde-bandeira"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden /> Compartilhar
        </button>
      </div>
    </div>
  );
}

