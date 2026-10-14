"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Info, Send, X } from "lucide-react";
import { PAUTAS, exemploPratico, rotuloCurto, urlFonteOficial } from "@/lib/pautas";
import Link from "next/link";
import {
  COR_ALINHAMENTO,
  ROTULO_VOTO_BRUTO,
  explicarPontuacao,
  numeroCompacto,
  resumoVoto,
  rotuloAlinhamento,
  rotuloCargo,
  textoDaCor,
} from "@/lib/parlamentares";
import type { AlinhamentoVoto, ParlamentarConsolidado } from "@/types/parlamentar";
import { CitizenBadgeCard } from "./CitizenBadgeCard";
import { CardPauta } from "./CardPauta";
import { SocialShareBar } from "./SocialShareBar";
import {
  mensagemParlamentar,
  mensagemParlamentarNaPauta,
  urlDeputado,
  urlWhatsApp,
} from "@/lib/share";

export function DossieModal({
  parlamentar,
  onFechar,
  pautaSel,
}: {
  parlamentar: ParlamentarConsolidado;
  onFechar: () => void;
  /** Pauta em destaque na home: habilita o cartão focado na matéria. */
  pautaSel?: string;
}) {
  const pautaAtiva = PAUTAS.find((p) => p.slug === pautaSel) ?? null;
  const alinhamentoDestaque: AlinhamentoVoto = pautaAtiva
    ? (parlamentar.votos[pautaAtiva.slug] ?? "AUSENTE")
    : "AUSENTE";
  const votoBrutoDestaque = pautaAtiva
    ? parlamentar.votosOriginais?.[pautaAtiva.slug]
    : undefined;

  // Placar resumo + filtro rápido da lista de pautas (dossiê compacto).
  const explicacao = explicarPontuacao(parlamentar);
  const [filtro, setFiltro] = useState<"todas" | "divergencias" | "apoios" | "ausencias">("todas");
  const [infoAberta, setInfoAberta] = useState<string | null>(null);

  const votouEm = explicacao.favoraveis + explicacao.contras + explicacao.abstencoes;
  const ausencias = explicacao.ausentes + explicacao.abstencoes + explicacao.semVoto;

  const alinhamentoDaPauta = (slug: string) => parlamentar.votos[slug] ?? "AUSENTE";
  const pautasVisiveis = PAUTAS.filter((p) => {
    if (filtro === "todas") return true;
    const a = alinhamentoDaPauta(p.slug);
    if (filtro === "apoios") return a === "FAVORAVEL";
    if (filtro === "divergencias") return a === "CONTRA";
    return a !== "FAVORAVEL" && a !== "CONTRA";
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFechar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-verde-mata/60 p-4 backdrop-blur-sm"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label={`Dossiê de ${parlamentar.nome}`}
    >
      <div
        className="my-4 w-full max-w-4xl rounded-2xl bg-superficie p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={parlamentar.fotoUrl}
              alt={parlamentar.nome}
              width={64}
              height={64}
              unoptimized
              className="h-16 w-16 rounded-full border-2 border-borda object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-titulo">{parlamentar.nome}</h2>
              <p className="text-sm text-corpo">
                {rotuloCargo(parlamentar.cargo)} • {parlamentar.partido} • {parlamentar.uf}
              </p>
              {parlamentar.votosEleicao > 0 && (
                <p
                  data-votos={parlamentar.votosEleicao}
                  title={`${parlamentar.votosEleicao.toLocaleString("pt-BR")} votos recebidos nas urnas (TSE)`}
                  className="mt-0.5 text-xs font-bold text-titulo"
                >
                  🗳️ {numeroCompacto(parlamentar.votosEleicao)} votos nas urnas (TSE) ·{" "}
                  {parlamentar.votosEleicao.toLocaleString("pt-BR")}
                </p>
              )}
              <a
                href={parlamentar.urlPerfilOficial}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-corpo hover:underline"
              >
                Perfil oficial {parlamentar.cargo === "SENADOR" ? "no Senado" : "na Câmara"}{" "}
                <ExternalLink className="h-3 w-3" />
              </a>
              <div className="mt-3">
                <SocialShareBar
                  mensagem={mensagemParlamentar(parlamentar)}
                  url={urlDeputado(parlamentar.id)}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-corpo transition hover:bg-trilha hover:text-titulo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {pautaAtiva && (
          <div
            data-destaque="pauta"
            className="mb-5 rounded-2xl border border-dourado/60 bg-dourado/5 p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-corpo">
              Você está vendo esta votação
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 className="text-lg font-black text-titulo">{pautaAtiva.rotuloPopular}</h3>
              <span className="rounded-md border border-borda bg-superficie px-2 py-0.5 text-[11px] font-bold text-titulo">
                {pautaAtiva.materia}
              </span>
              <span
                className="rounded-md px-2 py-1 text-[11px] font-bold"
                style={{
                  backgroundColor: COR_ALINHAMENTO[alinhamentoDestaque],
                  color: textoDaCor(alinhamentoDestaque),
                }}
              >
                {rotuloAlinhamento(alinhamentoDestaque, pautaAtiva.slug)}
              </span>
            </div>
            <p className="mt-2 text-xs text-corpo">{pautaAtiva.ementaOficial}</p>
            <p
              data-exemplo-pratico={pautaAtiva.slug}
              className="mt-2 rounded-lg border border-dourado/40 bg-dourado/5 px-3 py-2 text-[11px] leading-relaxed text-titulo"
            >
              <strong>No dia a dia:</strong> {exemploPratico(pautaAtiva)}
            </p>
            <p className="mt-1 text-[11px] text-corpo-fraco">
              {votoBrutoDestaque
                ? `Voto registrado na fonte oficial: ${ROTULO_VOTO_BRUTO[votoBrutoDestaque]}.`
                : (parlamentar.motivos?.[pautaAtiva.slug] ??
                  pautaAtiva.senado?.nota ??
                  "Sem voto individual registrado.")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={urlFonteOficial(pautaAtiva)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-borda bg-superficie px-2.5 py-1 text-[11px] font-semibold text-titulo hover:border-dourado"
              >
                {pautaAtiva.casa === "SENADO" ? "Senado" : "Câmara"} — fonte oficial{" "}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={urlWhatsApp(
                  mensagemParlamentarNaPauta(parlamentar, pautaAtiva, {
                    alinhamento: alinhamentoDestaque,
                    bruto: votoBrutoDestaque,
                  }),
                )}
                target="_blank"
                rel="noopener noreferrer"
                title={`Compartilhar no WhatsApp a votação de ${pautaAtiva.materia}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-[#052e16] transition hover:bg-[#20ba59]"
              >
                <Send className="h-3 w-3" aria-hidden /> Compartilhar no WhatsApp
              </a>
              <Link
                href={
                  pautaAtiva.materia.startsWith("PEC") ? "/poderes#regua" : "/poderes#linha-do-tempo"
                }
                data-ajuda-quorum={pautaAtiva.materia.startsWith("PEC") ? "pec" : "lei"}
                title={
                  pautaAtiva.materia.startsWith("PEC")
                    ? "Explicação: quantos votos uma PEC precisa"
                    : "Explicação: como uma lei é aprovada"
                }
                className="inline-flex items-center gap-1 rounded-lg border border-borda bg-superficie px-2.5 py-1 text-[11px] font-semibold text-titulo transition hover:border-dourado"
              >
                <Info className="h-3 w-3" aria-hidden />
                {pautaAtiva.materia.startsWith("PEC")
                  ? "O que é preciso para aprovar uma PEC?"
                  : "Como uma lei é aprovada?"}
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            {/* Placar resumo */}
            <div className="mb-3 rounded-xl border border-borda bg-fundo-neutro p-3">
              <p className="text-xs font-semibold text-titulo">
                Votou em {votouEm} de {PAUTAS.length} pautas prioritárias
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-verde-bandeira/40 bg-verde-bandeira/10 px-2 py-0.5 text-[11px] font-bold text-titulo">
                  🟢 {explicacao.favoraveis} apoios
                </span>
                <span className="rounded-full border border-contra/30 bg-contra/10 px-2 py-0.5 text-[11px] font-bold text-titulo">
                  🔴 {explicacao.contras} divergências
                </span>
                <span className="rounded-full border border-borda bg-trilha/50 px-2 py-0.5 text-[11px] font-bold text-corpo">
                  ⚪ {ausencias} ausências/abstenções
                </span>
              </div>
            </div>

            {/* Filtro rápido */}
            <div className="mb-3 flex flex-wrap gap-1.5" aria-label="Filtrar votações">
              {(
                [
                  { valor: "todas", rotulo: `Todas (${PAUTAS.length})` },
                  { valor: "divergencias", rotulo: `🔴 Divergências` },
                  { valor: "apoios", rotulo: `🟢 Apoios` },
                  { valor: "ausencias", rotulo: `⚪ Ausências` },
                ] as const
              ).map((aba) => (
                <button
                  key={aba.valor}
                  type="button"
                  onClick={() => setFiltro(aba.valor)}
                  aria-pressed={filtro === aba.valor}
                  data-filtro-dossie={aba.valor}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                    filtro === aba.valor
                      ? "border-dourado bg-dourado/15 text-titulo"
                      : "border-borda bg-superficie text-corpo hover:border-dourado/50"
                  }`}
                >
                  {aba.rotulo}
                </button>
              ))}
            </div>

            <h3 className="mb-1 text-sm font-bold text-titulo">
              Todas as {PAUTAS.length} pautas — visão geral
            </h3>
            <p className="mb-3 text-[11px] text-corpo">
              Como o <strong className="text-titulo">Alinhamento Cívico</strong> é calculado?{" "}
              <Link href="/sobre#metodologia" className="font-semibold underline">
                ver a metodologia
              </Link>
            </p>
            <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
              {pautasVisiveis.map((pauta) => {
                const a: AlinhamentoVoto = parlamentar.votos[pauta.slug] ?? "AUSENTE";
                const bruto = parlamentar.votosOriginais?.[pauta.slug];
                const motivo = parlamentar.motivos?.[pauta.slug];
                const resumo = resumoVoto(a);
                return (
                  <div
                    key={pauta.slug}
                    data-pauta-linha={pauta.slug}
                    className={`flex items-center gap-2 rounded-xl border border-borda px-3 py-2 ${
                      resumo.tom === "neutro" ? "bg-trilha/40" : "bg-fundo-neutro"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="max-w-[180px] truncate text-sm font-medium text-titulo sm:max-w-none">
                          {rotuloCurto(pauta)}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setInfoAberta(infoAberta === pauta.slug ? null : pauta.slug)
                          }
                          aria-expanded={infoAberta === pauta.slug}
                          aria-label={`Detalhes de ${pauta.materia}`}
                          title={`${pauta.rotuloPopular} — ${pauta.ementaOficial}`}
                          className="shrink-0 rounded p-0.5 text-corpo-fraco transition hover:text-titulo"
                        >
                          <Info className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                      <p className="truncate text-xs text-corpo">
                        {pauta.materia} ({rotuloCurto(pauta)})
                        {bruto ? ` · voto: ${ROTULO_VOTO_BRUTO[bruto]}` : ""}
                      </p>
                      {!bruto && motivo && (
                        <p className="truncate text-[10px] leading-snug text-corpo" title={motivo}>
                          {motivo}
                        </p>
                      )}
                      {infoAberta === pauta.slug && (
                        <div className="mt-2 rounded-lg border border-borda bg-superficie p-2 text-[11px] text-corpo">
                          <strong className="text-titulo">{pauta.rotuloPopular}</strong>
                          <span className="mt-1 block">{pauta.ementaOficial}</span>
                          {motivo && <span className="mt-1 block text-corpo-fraco">{motivo}</span>}
                        </div>
                      )}
                    </div>

                    <span
                      className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold"
                      style={{ backgroundColor: COR_ALINHAMENTO[a], color: textoDaCor(a) }}
                      title={rotuloAlinhamento(a, pauta.slug)}
                    >
                      {resumo.emoji} {resumo.texto}
                    </span>

                    <a
                      href={urlWhatsApp(
                        mensagemParlamentarNaPauta(parlamentar, pauta, {
                          alinhamento: a,
                          bruto,
                        }),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Enviar esta votação"
                      title={`Compartilhar no WhatsApp a votação de ${pauta.materia}`}
                      className="shrink-0 rounded-lg bg-[#25D366] p-1.5 text-[#052e16] transition hover:bg-[#20ba59]"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden />
                    </a>
                    <a
                      href={urlFonteOficial(pauta)}
                      data-fonte-pauta={pauta.slug}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Fonte oficial de ${pauta.materia}`}
                      title={`${pauta.materia} — fonte oficial`}
                      className="shrink-0 rounded-lg border border-borda p-1.5 text-corpo transition hover:text-titulo"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 md:border-l md:border-borda md:pl-6">
            {pautaAtiva && (
              <div className="w-full">
                <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-corpo">
                  Cartão da pauta · {pautaAtiva.materia}
                </h3>
                <CardPauta parlamentar={parlamentar} pauta={pautaAtiva} />
              </div>
            )}

            <div className="w-full border-t border-borda pt-4">
              <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-corpo">
                Cartão para redes sociais
              </h3>
              <CitizenBadgeCard parlamentar={parlamentar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

