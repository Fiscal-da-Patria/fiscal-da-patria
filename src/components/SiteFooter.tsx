import Link from "next/link";
import { SocialShareBar } from "./SocialShareBar";

export function SiteFooter() {
  return (
    <footer className="border-t border-borda bg-superficie/60 px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col items-center gap-3 text-center text-[11px] text-corpo sm:flex-row sm:justify-between sm:text-left">
          <p>
            Fiscal da Pátria • Dados públicos das votações nominais da Câmara dos Deputados
            (dadosabertos.camara.leg.br). Não há pedido de voto.
          </p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <Link
              href="/poderes"
              className="shrink-0 font-semibold text-corpo transition hover:text-titulo hover:underline"
            >
              Entenda os 3 Poderes e Leis
            </Link>
            <Link
              href="/sobre"
              className="shrink-0 font-semibold text-corpo transition hover:text-titulo hover:underline"
            >
              Manifesto Cívico &amp; Transparência
            </Link>
          </div>
        </div>

        <p className="border-t border-borda pt-4 text-center text-[11px] leading-relaxed text-corpo-fraco">
          Fiscal da Pátria é uma iniciativa cívica voluntária, independente e sem fins lucrativos. Não possuímos
          vínculo com partidos políticos, candidatos ou órgãos estatais. Todos os dados exibidos são públicos e
          extraídos diretamente do portal oficial dadosabertos.camara.leg.br conforme a Lei de Acesso à Informação
          (Lei 12.527/2011).
        </p>

        <div className="border-t border-borda pt-4">
          <p className="mb-3 text-center text-[11px] font-medium text-corpo">
            Ajude a espalhar a verdade: compartilhe com sua família e amigos.
          </p>
          <SocialShareBar />
        </div>
      </div>
    </footer>
  );
}


