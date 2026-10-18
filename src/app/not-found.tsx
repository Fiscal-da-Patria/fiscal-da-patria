import Link from "next/link";
import { ArrowLeft, Home, Scale, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * 404 global do App Router. Também vira `out/404.html` no export estático,
 * servido pelo Worker em `assets.not_found_handling: "404-page"`.
 */
export default function NotFound() {
  return (
    <div data-not-found="1" className="flex min-h-screen flex-col">
      <SiteHeader />

      <main
        id="conteudo"
        className="mx-auto w-full max-w-3xl flex-1 scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-dourado/40 bg-dourado/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-corpo">
            <Search className="h-3.5 w-3.5" aria-hidden /> Erro 404
          </span>

          <p className="mt-6 font-mono text-6xl font-black tracking-tighter text-dourado sm:text-7xl">
            404
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-titulo sm:text-3xl">
            Página não encontrada
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-corpo">
            O endereço que você tentou abrir não existe ou foi movido. Nenhum dado foi perdido:
            o painel de votações continua disponível para você conferir os fatos.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-dourado px-5 py-2.5 text-sm font-black text-verde-mata shadow-sm transition hover:bg-dourado/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-mata"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar para a fiscalização
            </Link>
            <Link
              href="/poderes"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-borda bg-superficie px-5 py-2.5 text-sm font-bold text-titulo transition hover:border-dourado focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
            >
              Entenda os 3 Poderes
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Link
            href="/"
            className="rounded-xl border border-borda bg-superficie p-4 transition hover:border-dourado hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
          >
            <Home className="h-5 w-5 text-dourado" aria-hidden />
            <p className="mt-2 text-sm font-bold text-titulo">Painel de votações</p>
            <p className="mt-1 text-xs leading-relaxed text-corpo">
              Veja como cada deputado e senador votou nas pautas do Congresso.
            </p>
          </Link>
          <Link
            href="/poderes"
            className="rounded-xl border border-borda bg-superficie p-4 transition hover:border-dourado hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
          >
            <Scale className="h-5 w-5 text-dourado" aria-hidden />
            <p className="mt-2 text-sm font-bold text-titulo">Entenda os Poderes</p>
            <p className="mt-1 text-xs leading-relaxed text-corpo">
              Os 3 Poderes, a régua dos votos e o caminho de uma lei.
            </p>
          </Link>
          <Link
            href="/sobre"
            className="rounded-xl border border-borda bg-superficie p-4 transition hover:border-dourado hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
          >
            <ShieldCheck className="h-5 w-5 text-dourado" aria-hidden />
            <p className="mt-2 text-sm font-bold text-titulo">Sobre o projeto</p>
            <p className="mt-1 text-xs leading-relaxed text-corpo">
              O manifesto cívico, as fontes oficiais e os compromissos de transparência.
            </p>
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
