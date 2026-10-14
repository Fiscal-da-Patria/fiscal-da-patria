import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-verde-mata text-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-dourado font-black text-verde-mata">
            FP
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight sm:text-lg">
              Fiscal da <span className="text-dourado">Pátria</span>
            </h1>
            <p className="hidden text-[11px] text-white/70 sm:block">
              Auditoria cívica das votações da Câmara
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/poderes"
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:px-3"
          >
            <span className="sm:hidden">3 Poderes</span>
            <span className="hidden sm:inline">Entenda os 3 Poderes</span>
          </Link>
          <Link
            href="/sobre"
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white sm:px-3"
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


