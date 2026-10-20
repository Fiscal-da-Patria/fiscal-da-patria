"use client";

import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  FileText,
  Info,
  Scale,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { Modal } from "./Modal";
import type { PautaConfig } from "@/types/parlamentar";

/** Ícones dos pontos explicativos (na ordem em que aparecem). */
const ICONES = [Scale, CalendarClock, Wallet, FileText];

/**
 * "O que foi aprovado?" — explicação factual de uma pauta já concluída.
 *
 * Só é renderizado quando a pauta tem `pontosExplicativos` (dado conferido na
 * fonte oficial). Nada aqui é opinião: cada ponto parafraseia o texto da norma
 * e os placares vêm do painel nominal das duas Casas.
 */
export function PautaDetalheModal({
  pauta,
  onFechar,
}: {
  pauta: PautaConfig;
  onFechar: () => void;
}) {
  if (!pauta.pontosExplicativos?.length) return null;

  const dataBR = (iso?: string) => (iso ? iso.split("-").reverse().join("/") : "");
  const dataStatus =
    pauta.dataRevogacao ??
    pauta.dataPromulgacao ??
    pauta.dataSancao ??
    pauta.dataArquivamento;
  const rotuloStatus =
    pauta.status === "PROMULGADA"
      ? "Promulgada"
      : pauta.status === "SANCIONADA"
        ? "Sancionada"
        : pauta.status === "REVOGADA"
          ? pauta.normaRevogadora?.startsWith("Medida Provisória")
            ? "Revogada por MP"
            : "Revogada"
          : "Arquivada";
  const arquivada = pauta.status === "ARQUIVADA";
  const revogada = pauta.status === "REVOGADA";
  const encerrada = arquivada || revogada;

  return (
    <Modal aoFechar={onFechar} rotuloId="titulo-pauta-detalhe" largura="max-w-2xl">
      <div data-pauta-detalhe="1" className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            {pauta.status && (
              <p
                data-status-norma="1"
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-titulo ${
                  encerrada
                    ? "border-dourado/60 bg-dourado/15"
                    : "border-tag-verde-borda bg-tag-verde-fundo"
                }`}
              >
                {encerrada ? (
                  <XCircle className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                )}
                {rotuloStatus}
                {dataStatus ? ` em ${dataBR(dataStatus)}` : ""}
              </p>
            )}
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-corpo">
              {arquivada
                ? "O que aconteceu com a proposta"
                : revogada
                  ? "O que aconteceu com a lei"
                  : "O que foi aprovado"}
            </p>
            <h2
              id="titulo-pauta-detalhe"
              className="mt-0.5 text-xl font-black leading-tight tracking-tight text-titulo sm:text-2xl"
            >
              {pauta.rotuloPopular}
            </h2>
            <p className="mt-1 text-xs text-corpo">
              {pauta.materia}
              {pauta.normaOficial ? ` → ${pauta.normaOficial}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar a explicação da pauta"
            className="shrink-0 rounded-xl border border-borda p-2 text-corpo transition hover:bg-trilha focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {pauta.resumoFactual && (
          <p className="mt-4 rounded-xl border border-dourado/40 bg-dourado/5 p-3 text-sm leading-relaxed text-titulo">
            {pauta.resumoFactual}
          </p>
        )}

        {pauta.situacaoAtual && (
          <p
            data-situacao-atual="1"
            className="mt-2 rounded-xl border border-verde-bandeira/30 bg-verde-bandeira/5 p-3 text-xs leading-relaxed text-corpo"
          >
            <strong className="text-titulo">Situação atual:</strong> {pauta.situacaoAtual}
          </p>
        )}

        {(pauta.resultadoCamara || pauta.resultadoSenado) && (
          <div className="mt-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {pauta.resultadoCamara && (
                <div
                  data-placar-camara="1"
                  className="rounded-xl border border-borda bg-fundo-neutro p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-corpo">
                    Câmara dos Deputados
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-titulo">
                    {pauta.resultadoCamara}
                  </p>
                </div>
              )}
              {pauta.resultadoSenado && (
                <div
                  data-placar-senado="1"
                  className="rounded-xl border border-borda bg-fundo-neutro p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-corpo">
                    Senado Federal
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-titulo">
                    {pauta.resultadoSenado}
                  </p>
                </div>
              )}
            </div>
            {pauta.senado?.status === "nominal" && pauta.senado.descricao && (
              <p
                data-detalhe-votacao-senado="1"
                className="mt-1.5 text-[10px] leading-relaxed text-corpo"
              >
                <strong className="text-titulo">Votação no Senado:</strong> {pauta.senado.descricao}
              </p>
            )}
            {!arquivada && (
              <p data-nota-placar="1" className="mt-1.5 text-[10px] leading-relaxed text-corpo">
                O painel da sessão inclui quem já deixou o mandato. A lista abaixo mostra os{" "}
                <strong className="text-titulo">parlamentares em exercício</strong> — por isso a
                soma pode ser menor que o placar oficial. O placar soma apenas SIM, NÃO e
                ABSTENÇÃO; registros de Presidente, AP (atividade parlamentar), P-NRV, LS
                (licença-saúde) e NCom (não compareceu) não entram nessa soma.
              </p>
            )}
          </div>
        )}

        <ol className="mt-5 space-y-4">
          {pauta.pontosExplicativos.map((ponto, i) => {
            const Icone = ICONES[i] ?? Info;
            return (
              <li key={ponto.titulo} data-ponto-explicativo="1" className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dourado/50 bg-dourado/10 text-titulo">
                  <Icone className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-titulo">
                    {i + 1}. {ponto.titulo}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-corpo">{ponto.texto}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {pauta.ressalva && (
          <p
            data-ressalva="1"
            className="mt-5 rounded-xl border border-borda bg-trilha/40 p-3 text-[11px] leading-relaxed text-corpo"
          >
            <strong className="text-titulo">Ressalva do texto:</strong> {pauta.ressalva}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-borda pt-4">
          {pauta.urlNorma && (
            <a
              href={pauta.urlNorma}
              target="_blank"
              rel="noopener noreferrer"
              data-link-norma="1"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-verde-bandeira underline decoration-dotted underline-offset-2 hover:text-titulo dark:text-dourado"
            >
              Ler a {pauta.normaOficial ?? "norma"} no Planalto
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          {!pauta.urlNorma && pauta.senado?.urlMateria && (
            <a
              href={pauta.senado.urlMateria}
              target="_blank"
              rel="noopener noreferrer"
              data-link-materia="1"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-verde-bandeira underline decoration-dotted underline-offset-2 hover:text-titulo dark:text-dourado"
            >
              Ver a matéria no Senado
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          {pauta.urlNormaRevogadora && (
            <a
              href={pauta.urlNormaRevogadora}
              target="_blank"
              rel="noopener noreferrer"
              data-link-norma-revogadora="1"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-verde-bandeira underline decoration-dotted underline-offset-2 hover:text-titulo dark:text-dourado"
            >
              Ler a {pauta.normaRevogadora ?? "norma revogadora"} no Planalto
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          {pauta.urlMateriaRevogadora && (
            <a
              href={pauta.urlMateriaRevogadora}
              target="_blank"
              rel="noopener noreferrer"
              data-link-materia-revogadora="1"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-verde-bandeira underline decoration-dotted underline-offset-2 hover:text-titulo dark:text-dourado"
            >
              Ver a tramitação da MP na Câmara
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          <a
            href="/poderes#linha-do-tempo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-corpo underline decoration-dotted underline-offset-2 hover:text-titulo"
          >
            Como uma lei é aprovada?
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </Modal>
  );
}

