"use client";

import { useEffect } from "react";
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
} from "lucide-react";
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
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFechar]);

  if (!pauta.pontosExplicativos?.length) return null;

  const dataBR = (iso?: string) => (iso ? iso.split("-").reverse().join("/") : "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onFechar}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-pauta-detalhe"
        data-pauta-detalhe="1"
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-2xl border border-borda bg-superficie p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            {pauta.status === "PROMULGADA" && (
              <p
                data-status-norma="1"
                className="inline-flex items-center gap-1 rounded-full border border-verde-bandeira/40 bg-verde-bandeira/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-titulo"
              >
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Promulgada
                {pauta.dataPromulgacao ? ` em ${dataBR(pauta.dataPromulgacao)}` : ""}
              </p>
            )}
            <h2
              id="titulo-pauta-detalhe"
              className="mt-2 text-xl font-black leading-tight tracking-tight text-titulo sm:text-2xl"
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

        {(pauta.resultadoCamara || pauta.resultadoSenado) && (
          <div className="mt-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {pauta.resultadoCamara && (
                <div
                  data-placar-camara="1"
                  className="rounded-xl border border-borda bg-fundo-neutro p-3"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-corpo">
                    Placar oficial na Câmara
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
                    Placar oficial no Senado
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-titulo">
                    {pauta.resultadoSenado}
                  </p>
                </div>
              )}
            </div>
            <p data-nota-placar="1" className="mt-1.5 text-[10px] leading-relaxed text-corpo">
              O painel da sessão inclui quem já deixou o mandato. A lista abaixo mostra os{" "}
              <strong className="text-titulo">parlamentares em exercício</strong> — por isso a
              soma pode ser menor que o placar oficial.
            </p>
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
          <a
            href="/poderes#linha-do-tempo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-corpo underline decoration-dotted underline-offset-2 hover:text-titulo"
          >
            Como uma lei é aprovada?
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

