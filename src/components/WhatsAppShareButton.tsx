import { Send } from "lucide-react";
import { MENSAGEM_OFICIAL, urlWhatsApp } from "@/lib/share";

/**
 * Botão de compartilhamento do WhatsApp.
 * `primario` usa o verde da marca; `secundario` vira um botão de contorno para
 * não competir com a ação principal (ver os votos).
 */
export function WhatsAppShareButton({
  mensagem = MENSAGEM_OFICIAL,
  rotulo = "📲 Enviar no WhatsApp",
  titulo,
  variante = "primario",
  className = "px-4 py-2.5 text-sm",
}: {
  mensagem?: string;
  rotulo?: string;
  titulo?: string;
  variante?: "primario" | "secundario";
  className?: string;
}) {
  const visual =
    variante === "secundario"
      ? "border border-borda bg-superficie text-titulo hover:bg-trilha"
      : "bg-whatsapp text-whatsapp-texto shadow-sm hover:bg-whatsapp-escuro";

  return (
    <a
      href={urlWhatsApp(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      title={titulo}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp ${visual} ${className}`}
    >
      <Send className="h-4 w-4 shrink-0" aria-hidden />
      <span>{rotulo}</span>
    </a>
  );
}