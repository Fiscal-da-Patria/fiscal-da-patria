"use client";

import { useSyncExternalStore, useState } from "react";
import { Check, Copy, Send, Share2 } from "lucide-react";
import { MENSAGEM_OFICIAL, SITE_URL, urlTelegram, urlWhatsApp, urlX } from "@/lib/share";

/** Base visual compartilhada — todos os botões em contraste AA (claro e escuro). */
const BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors";

export function SocialShareBar({
  mensagem = MENSAGEM_OFICIAL,
  url = SITE_URL,
  textoX,
  className = "",
}: {
  mensagem?: string;
  url?: string;
  textoX?: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  // Detecta suporte à Web Share API sem setState em efeito (SSR-safe).
  const podeCompartilhar = useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== "undefined" && typeof navigator.share === "function",
    () => false,
  );

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  }

  async function compartilharNativo() {
    try {
      await navigator.share({ title: "Fiscal da Pátria", text: mensagem, url });
    } catch {
      /* usuário cancelou */
    }
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${className}`}>
      {/* WhatsApp — prioridade (verde da marca + texto escuro → AA ~7,3:1) */}
      <a
        href={urlWhatsApp(mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN} bg-whatsapp text-whatsapp-texto hover:bg-whatsapp-escuro`}
      >
        <Send className="h-4 w-4 shrink-0" aria-hidden /> WhatsApp
      </a>

      {/* Telegram (#0077b5 + branco → 4,88:1) */}
      <a
        href={urlTelegram(mensagem, url)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN} bg-telegram text-white hover:bg-telegram-escuro`}
      >
        <Send className="h-4 w-4 shrink-0" aria-hidden /> Telegram
      </a>

      {/* X (Twitter) — preto + branco → 21:1 */}
      <a
        href={urlX(textoX, url)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BTN} bg-black text-white hover:bg-neutral-800 dark:border-white/25`}
      >
        <Share2 className="h-4 w-4 shrink-0" aria-hidden /> X (Twitter)
      </a>

      {/* Copiar link — slate-800 + branco → ~14,6:1 */}
      <button
        type="button"
        onClick={copiar}
        aria-live="polite"
        className={`${BTN} bg-slate-800 text-white hover:bg-slate-700 dark:border-white/20 dark:bg-slate-700 dark:hover:bg-slate-600`}
      >
        {copiado ? (
          <>
            <Check className="h-4 w-4 shrink-0" aria-hidden /> Copiado! ✓
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 shrink-0" aria-hidden /> Copiar Link
          </>
        )}
      </button>

      {/* Web Share API nativo (quando suportado) */}
      {podeCompartilhar && (
        <button
          type="button"
          onClick={compartilharNativo}
          className={`${BTN} bg-verde-mata text-white hover:bg-verde-bandeira`}
        >
          <Share2 className="h-4 w-4 shrink-0" aria-hidden /> Mais opções
        </button>
      )}
    </div>
  );
}

