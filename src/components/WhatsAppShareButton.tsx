import { Send } from "lucide-react";
import { MENSAGEM_OFICIAL, urlWhatsApp } from "@/lib/share";

/**
 * Botão de compartilhamento do WhatsApp (destaque prioritário).
 * Verde oficial da marca (#25D366) com texto escuro → contraste AA (~7,3:1).
 */
export function WhatsAppShareButton({
  mensagem = MENSAGEM_OFICIAL,
  rotulo = "📲 Enviar no WhatsApp",
  titulo,
  className = "px-4 py-2.5 text-sm",
}: {
  mensagem?: string;
  rotulo?: string;
  titulo?: string;
  className?: string;
}) {
  return (
    <a
      href={urlWhatsApp(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      title={titulo}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] font-semibold text-[#052e16] shadow-sm transition-colors hover:bg-[#20ba59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${className}`}
    >
      <Send className="h-4 w-4 shrink-0" aria-hidden />
      <span>{rotulo}</span>
    </a>
  );
}

