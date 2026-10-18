import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-verde-mata text-white shadow-sm">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-dourado focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-verde-mata"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-dourado text-sm font-black text-verde-mata sm:h-9 sm:w-9 sm:text-base">
            FP
          </span>
          <div className="leading-tight">
            <span className="text-sm font-bold tracking-tight sm:text-lg">
              Fiscal da <span className="text-dourado">Pátria</span>
            </span>
            <p className="hidden text-[11px] text-white/70 sm:block">
              Auditoria cívica das votações da Câmara e do Senado
            </p>
          </div>
        </Link>
        <nav aria-label="Navegação principal" className="flex items-center gap-0.5 sm:gap-2">
          <Link
            href="/poderes"
            className="rounded-full px-2 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:px-3"
          >
            <span className="sm:hidden">3 Poderes</span>
            <span className="hidden sm:inline">Entenda os 3 Poderes</span>
          </Link>
          <Link
            href="/sobre"
            className="rounded-full px-2 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:px-3"
          >
            <span className="sm:hidden">Sobre</span>
            <span className="hidden sm:inline">Sobre o Projeto</span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-dourado" /> Dados oficiais
          </span>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


