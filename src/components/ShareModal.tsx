"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Link2, Send, X } from "lucide-react";
import { Modal } from "./Modal";
import { ShareCard } from "./ShareCard";
import { ShareCardPartido } from "./ShareCardPartido";
import { ShareCardTop5 } from "./ShareCardTop5";
import {
  mensagemParlamentarNaPauta,
  mensagemPartido,
  mensagemTop5,
  urlParlamentarNaPauta,
  urlRecorte,
  urlWhatsApp,
  type FiltrosRecorte,
} from "@/lib/share";
import { resumoPartido, type LinhaPartido } from "@/lib/partidos";
import type { AlinhamentoVoto, PautaConfig, ParlamentarConsolidado } from "@/types/parlamentar";

/** O que está sendo compartilhado: um parlamentar, uma bancada ou o top 5. */
export type AlvoCompartilhar =
  | { tipo: "parlamentar"; parlamentar: ParlamentarConsolidado }
  | { tipo: "partido"; linha: LinhaPartido }
  | { tipo: "top5"; linhas: LinhaPartido[] };

/**
 * Prévia + ações de compartilhamento (um voto, uma bancada ou o top 5).
 *
 * A imagem (1080×1350) sai daqui pronta para o WhatsApp; no celular usamos a
 * Web Share API com arquivo (menu do sistema) e no desktop caímos para o
 * download + WhatsApp Web com o texto factual.
 */
export function ShareModal({
  alvo,
  pauta,
  recorte = "",
  cargoLabel = "parlamentares",
  filtros = {},
  onFechar,
}: {
  alvo: AlvoCompartilhar;
  pauta: PautaConfig;
  /** "Congresso Nacional" · "Senado Federal · UF: SP" (cartão de bancada). */
  recorte?: string;
  /** "deputados" · "senadores" · "parlamentares" (cartão de bancada). */
  cargoLabel?: string;
  /** Filtros ativos — o link compartilhado precisa abrir o MESMO recorte. */
  filtros?: FiltrosRecorte;
  onFechar: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const linkBase = urlRecorte(pauta.slug, filtros);
  const linkBancada =
    alvo.tipo === "partido" && !filtros.busca?.trim()
      ? `${linkBase}&busca=${encodeURIComponent(alvo.linha.partido)}`
      : linkBase;

  const texto =
    alvo.tipo === "parlamentar"
      ? mensagemParlamentarNaPauta(alvo.parlamentar, pauta, {
          alinhamento: (alvo.parlamentar.votos[pauta.slug] ?? "AUSENTE") as AlinhamentoVoto,
          bruto: alvo.parlamentar.votosOriginais?.[pauta.slug],
        })
      : alvo.tipo === "partido"
        ? mensagemPartido(
            alvo.linha,
            resumoPartido(alvo.linha, pauta.slug),
            pauta,
            recorte,
            linkBancada,
          )
        : mensagemTop5(alvo.linhas, pauta, recorte, linkBase);

  const link =
    alvo.tipo === "parlamentar"
      ? urlParlamentarNaPauta(alvo.parlamentar.id, pauta.slug)
      : alvo.tipo === "partido"
        ? linkBancada
        : linkBase;

  const nomeBase =
    alvo.tipo === "parlamentar"
      ? alvo.parlamentar.nome
      : alvo.tipo === "partido"
        ? alvo.linha.partido
        : "Top5_Bancadas";
  const titulo =
    alvo.tipo === "parlamentar"
      ? "Compartilhar o voto"
      : alvo.tipo === "partido"
        ? "Compartilhar o partido"
        : "Compartilhar o top 5";
  const descricao =
    alvo.tipo === "parlamentar"
      ? "A imagem vai com nome, partido, matéria e voto. Confira antes de enviar."
      : alvo.tipo === "partido"
        ? "A imagem vai com o partido, a matéria e como a bancada votou. Confira antes de enviar."
        : "A imagem vai com as 5 maiores bancadas, a matéria e como cada uma votou. Confira antes de enviar.";
  const tituloShare =
    alvo.tipo === "parlamentar"
      ? `Voto de ${alvo.parlamentar.nome}`
      : alvo.tipo === "partido"
        ? `${alvo.linha.partido} — ${pauta.materia}`
        : `Top 5 bancadas — ${pauta.materia}`;

  const nomeArquivo = () =>
    `Fiscal_da_Patria_${nomeBase.replace(/\s+/g, "_")}_${pauta.materia.replace(
      /[^\w]+/g,
      "-",
    )}.png`;

  async function gerarBlob(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      canvasWidth: 1080,
      canvasHeight: 1350,
      pixelRatio: 1,
    });
    return (await fetch(dataUrl)).blob();
  }

  function baixarBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo();
    a.click();
    URL.revokeObjectURL(url);
  }

  async function baixar() {
    setGerando(true);
    try {
      const blob = await gerarBlob();
      if (blob) baixarBlob(blob);
    } catch (err) {
      console.error("Falha ao gerar a imagem:", err);
    } finally {
      setGerando(false);
    }
  }

  async function compartilhar() {
    setGerando(true);
    try {
      const blob = await gerarBlob();
      if (blob) {
        const arquivo = new File([blob], nomeArquivo(), { type: "image/png" });
        const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
        if (nav.canShare?.({ files: [arquivo] })) {
          await navigator.share({
            files: [arquivo],
            title: tituloShare,
            text: texto,
          });
          return;
        }
        baixarBlob(blob);
      }
      window.open(urlWhatsApp(texto), "_blank", "noopener,noreferrer");
    } catch {
      /* usuário cancelou o menu do sistema */
    } finally {
      setGerando(false);
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(`${texto}\n\n${link}`);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  }

  return (
    <Modal aoFechar={onFechar} rotuloId="share-titulo">
      <div className="p-3 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="share-titulo" className="text-base font-black text-titulo">
              {titulo}
            </h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-corpo">{descricao}</p>
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

        <div className="flex justify-center rounded-xl bg-fundo-neutro p-1">
          {alvo.tipo === "parlamentar" ? (
            <ShareCard parlamentar={alvo.parlamentar} pauta={pauta} ref={cardRef} />
          ) : alvo.tipo === "partido" ? (
            <ShareCardPartido
              linha={alvo.linha}
              pauta={pauta}
              recorte={recorte}
              cargoLabel={cargoLabel}
              ref={cardRef}
            />
          ) : (
            <ShareCardTop5 linhas={alvo.linhas} pauta={pauta} recorte={recorte} ref={cardRef} />
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={compartilhar}
            disabled={gerando}
            data-compartilhar="1"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#052e16] transition hover:bg-[#20ba59] disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden />
            {gerando ? "Gerando imagem…" : "Compartilhar"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={baixar}
              disabled={gerando}
              data-baixar-imagem="1"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-borda bg-superficie px-3 py-2 text-xs font-bold text-titulo transition hover:border-dourado disabled:opacity-60"
            >
              <Download className="h-4 w-4" aria-hidden /> Baixar PNG
            </button>
            <button
              type="button"
              onClick={copiarLink}
              data-copiar-link="1"
              aria-live="polite"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-borda bg-superficie px-3 py-2 text-xs font-bold text-titulo transition hover:border-dourado"
            >
              <Link2 className="h-4 w-4" aria-hidden /> {copiado ? "Copiado! ✓" : "Copiar link"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] leading-relaxed text-corpo">
          No celular, “Compartilhar” abre o menu do sistema com a imagem pronta. No computador, ela é
          baixada e o WhatsApp abre com o texto e o link.
        </p>
      </div>
    </Modal>
  );
}