"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Link2, Send, X } from "lucide-react";
import { ShareCard } from "./ShareCard";
import { mensagemParlamentarNaPauta, urlParlamentarNaPauta, urlWhatsApp } from "@/lib/share";
import type { AlinhamentoVoto, PautaConfig, ParlamentarConsolidado } from "@/types/parlamentar";

/**
 * Prévia + ações de compartilhamento de **um voto**.
 *
 * A imagem (1080×1350) sai daqui pronta para o WhatsApp; no celular usamos a
 * Web Share API com arquivo (menu do sistema) e no desktop caímos para o
 * download + WhatsApp Web com o texto factual.
 */
export function ShareModal({
  parlamentar,
  pauta,
  onFechar,
}: {
  parlamentar: ParlamentarConsolidado;
  pauta: PautaConfig;
  onFechar: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const alinhamento: AlinhamentoVoto = parlamentar.votos[pauta.slug] ?? "AUSENTE";
  const bruto = parlamentar.votosOriginais?.[pauta.slug];
  const texto = mensagemParlamentarNaPauta(parlamentar, pauta, { alinhamento, bruto });
  const link = urlParlamentarNaPauta(parlamentar.id, pauta.slug);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFechar]);

  const nomeArquivo = () =>
    `Fiscal_da_Patria_${parlamentar.nome.replace(/\s+/g, "_")}_${pauta.materia.replace(
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
            title: `Voto de ${parlamentar.nome}`,
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-verde-mata/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-titulo"
    >
      <div
        className="my-4 w-full max-w-sm rounded-2xl bg-superficie p-3 shadow-2xl sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="share-titulo" className="text-base font-black text-titulo">
              Compartilhar o voto
            </h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-corpo">
              A imagem vai com nome, partido, matéria e voto. Confira antes de enviar.
            </p>
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
          <ShareCard parlamentar={parlamentar} pauta={pauta} ref={cardRef} />
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
    </div>
  );
}