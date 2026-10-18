import Link from "next/link";
import { SocialShareBar } from "./SocialShareBar";

export function SiteFooter() {
  return (
    <footer className="border-t border-borda bg-superficie/60 px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center text-xs text-corpo">
        <p className="mx-auto max-w-3xl leading-relaxed">
          <strong className="text-titulo">Fiscal da Pátria</strong> é uma iniciativa cívica
          voluntária, independente e sem fins lucrativos. Não possuímos vínculo com partidos
          políticos, candidatos ou órgãos estatais. Todos os dados exibidos são públicos e extraídos
          diretamente dos portais oficiais dadosabertos.camara.leg.br e senado.leg.br conforme a Lei
          de Acesso à Informação (Lei 12.527/2011). Não há pedido de voto.
        </p>

        <nav
          aria-label="Navegação do rodapé"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
        >
          <Link
            href="/poderes"
            className="shrink-0 py-1 font-semibold transition hover:text-titulo hover:underline"
          >
            Entenda os 3 Poderes
          </Link>
          <Link
            href="/sobre"
            className="shrink-0 py-1 font-semibold transition hover:text-titulo hover:underline"
          >
            Sobre o projeto
          </Link>
        </nav>

        <div className="border-t border-borda pt-4">
          <p className="mb-3 font-medium">
            Ajude a espalhar a verdade: compartilhe com sua família e amigos.
          </p>
          <SocialShareBar />
        </div>
      </div>
    </footer>
  );
}


