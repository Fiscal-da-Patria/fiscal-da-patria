import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calculator,
  ExternalLink,
  HeartHandshake,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SocialShareBar } from "@/components/SocialShareBar";

export const metadata: Metadata = {
  title: "Sobre Nós — Manifesto Cívico | Fiscal da Pátria",
  description:
    "Manifesto cívico do Fiscal da Pátria: apenas fatos, zero opinião. Independência, fonte oficial e código aberto.",
};

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-corpo transition hover:text-titulo"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a fiscalização
        </Link>

        {/* Hero */}
        <header className="mt-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-dourado/40 bg-dourado/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-corpo">
            <ShieldCheck className="h-3.5 w-3.5" /> Manifesto Cívico
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-titulo sm:text-4xl">
            Sobre Nós
          </h1>
          <p className="mt-3 text-base leading-relaxed text-corpo">
            O <strong>Fiscal da Pátria</strong> é uma plataforma cívica, independente e estritamente
            apartidária de auditoria parlamentar. Nossa missão é traduzir o comportamento legislativo
            da Câmara dos Deputados em dados acessíveis, diretos e visualmente compreensíveis pelo
            eleitor comum.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-corpo">
            Traduzimos votações de grande repercussão para uma linguagem prática e conectada ao
            cotidiano: o preço da comida no supermercado, o desconto no contracheque e a criação de
            privilégios públicos.
          </p>
        </header>

        {/* Manifesto: a frase que resume por que fiscalizamos */}
        <blockquote
          data-manifesto="1"
          className="mt-6 border-l-4 border-dourado pl-4 text-base font-semibold italic leading-relaxed text-titulo"
        >
          &ldquo;Patriota de verdade não idolatra político; patriota de verdade fiscaliza os fatos
          para proteger a sua pátria.&rdquo;
        </blockquote>

        <hr className="my-10 border-borda" />

        {/* Seção 1 */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-bold text-titulo sm:text-2xl">
            <Scale className="h-5 w-5 shrink-0 text-dourado" /> Apenas Fatos, Zero Opinião
          </h2>
          <p className="mt-3 leading-relaxed text-corpo">
            Nesta plataforma, <strong>não há juízo de valor, adjetivação ou opiniões editoriais</strong>.
            Não dizemos o que você deve pensar e não recomendamos em quem você deve votar.
          </p>
          <p className="mt-3 leading-relaxed text-corpo">
            O Fiscal da Pátria não analisa discursos inflamados no plenário, cortes editados para redes
            sociais ou promessas de campanha. Nosso trabalho limita-se a um dado oficial e auditável:{" "}
            <strong>
              o registro nominal do voto registrado no painel eletrônico da Câmara dos Deputados
            </strong>
            .
          </p>
        </section>

        {/* Seção 2 — card em evidência */}
        <section className="mb-10">
          <div className="rounded-2xl border border-dourado/40 bg-dourado/5 p-6 sm:p-7">
            <h2 className="flex items-center gap-2 text-xl font-bold text-titulo sm:text-2xl">
              <AlertCircle className="h-5 w-5 shrink-0 text-dourado" /> Por que não temos campo de
              comentários?
            </h2>
            <p className="mt-3 leading-relaxed text-corpo">
              Esta página não possui área de comentários por uma escolha deliberada e consciente:
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-borda bg-superficie p-4">
                <h3 className="text-sm font-bold text-titulo">
                  Dados não são ringue de disputa
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-corpo">
                  A informação primária não é matéria de torcida; é um fato histórico documentado. Não
                  criamos este espaço para polarização artificial, brigas virtuais ou ofensas.
                </p>
              </div>
              <div className="rounded-xl border border-borda bg-superficie p-4">
                <h3 className="text-sm font-bold text-titulo">Foco no discernimento pessoal</h3>
                <p className="mt-1 text-sm leading-relaxed text-corpo">
                  Sem a poluição de debates ruidosos, cada pessoa tem espaço para absorver a informação
                  com clareza, calma, independência e sem manipulação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 3 — destaque máximo */}
        <section className="mb-10">
          <div className="rounded-2xl bg-verde-mata p-6 text-white shadow-lg sm:p-8">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-dourado">
              <HeartHandshake className="h-4 w-4" /> O Nosso Único Pedido
            </span>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
              O que pedimos a você
            </h2>
            <p className="mt-3 leading-relaxed text-white/85">
              Nós não pedimos doações, não pedimos o seu voto e não pedimos a sua filiação partidária.
            </p>
            <p className="mt-1 font-semibold text-dourado">A única coisa que pedimos é que você:</p>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dourado text-xs font-black text-titulo">
                  1
                </span>
                <p className="text-sm leading-relaxed text-white/90">
                  <strong>Analise as propostas:</strong> veja o que cada matéria realmente altera na
                  sua vida prática.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dourado text-xs font-black text-titulo">
                  2
                </span>
                <p className="text-sm leading-relaxed text-white/90">
                  <strong>Analise os votos:</strong> descubra como os deputados eleitos pelo seu
                  estado se posicionaram quando tiveram a chance de decidir.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dourado text-xs font-black text-titulo">
                  3
                </span>
                <p className="text-sm leading-relaxed text-white/90">
                  <strong>Exercite o seu senso crítico:</strong> questione discursos e compare
                  palavras com atitudes registradas.
                </p>
              </li>
            </ul>
            <p className="mt-6 border-t border-white/15 pt-4 text-sm leading-relaxed text-white/80">
              O verdadeiro poder do cidadão não está em repetir slogans de terceiros; está na
              capacidade de{" "}
              <strong className="text-white">
                pensar por conta própria, enxergar os fatos e construir, com consciência e união, o
                futuro do nosso país
              </strong>
              .
            </p>
          </div>
        </section>

        {/* Seção 3.5 — como ler o voto (âncora pública; sem nota/porcentagem) */}
        <section id="metodologia" className="mb-10 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-bold text-titulo sm:text-2xl">
            <Calculator className="h-5 w-5 shrink-0 text-dourado" /> Como ler o voto
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-corpo">
            Cada card mostra <strong className="text-titulo">um voto, de uma matéria</strong>, com o
            rótulo factual do que foi votado — sem nota, sem ranking de opinião. Para comparar as
            outras pautas, basta trocar a matéria no topo da página.
          </p>

          <ul className="mt-4 space-y-1.5 text-sm text-corpo">
            <li>
              <strong className="text-titulo">Apoiou</strong> (verde) — votou a favor do que a
              matéria propõe.
            </li>
            <li>
              <strong className="text-titulo">Rejeitou</strong> (vermelho) — votou contra o que a
              matéria propõe.
            </li>
            <li>
              <strong className="text-titulo">Abstenção</strong> — estava na sessão e não votou nem
              sim nem não.
            </li>
            <li>
              <strong className="text-titulo">Ausente</strong> — estava em exercício e não registrou
              voto.
            </li>
            <li>
              <strong className="text-titulo">Sem voto individual</strong> — a casa não teve votação
              nominal (votação simbólica) ou a matéria ainda não foi apreciada por ela. O motivo
              aparece no próprio card.
            </li>
          </ul>
          <p className="mt-3 text-[13px] leading-relaxed text-corpo">
            Cada pauta tem o seu <strong className="text-titulo">rótulo factual</strong> (2 a 3
            palavras) descrevendo a ação votada — por exemplo, na Cesta Básica,{" "}
            <em>&ldquo;Apoiou isenção&rdquo;</em> ou <em>&ldquo;Rejeitou isenção&rdquo;</em>. Em
            pautas de sentido invertido (como a PEC da Blindagem), o rótulo verde é{" "}
            <em>&ldquo;Rejeitou blindagem&rdquo;</em> — a ficha sempre mostra o fato, nunca um juízo
            de valor.
          </p>

          <div className="mt-4 rounded-xl border border-borda bg-superficie p-4 text-[13px] leading-relaxed text-corpo">
            <p>
              <strong className="text-titulo">Por que não tem nota?</strong> Nota e ranking viram
              torcida. O Fiscal da Pátria mostra o <strong className="text-titulo">fato</strong> — a
              matéria, o voto registrado e o link da fonte — e deixa a conclusão com você.
            </p>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-corpo">
            Todo voto vem do registro nominal oficial, com link para a fonte em cada ficha:{" "}
            <a
              href="https://dadosabertos.camara.leg.br"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              dadosabertos.camara.leg.br
            </a>{" "}
            e{" "}
            <a
              href="https://legis.senado.leg.br/dadosabertos"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              legis.senado.leg.br/dadosabertos
            </a>
            . O total de votos recebidos nas urnas (TSE) é usado apenas como critério de ordenação —
            nunca como juízo de valor.
          </p>
        </section>

        {/* Seção 4 — grid 3 pilares */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-titulo sm:text-2xl">
            Nossos Compromissos de Transparência
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-borda bg-superficie p-5">
              <ShieldCheck className="h-6 w-6 text-titulo" />
              <h3 className="mt-3 text-sm font-bold text-titulo">Fonte oficial e auditável</h3>
              <p className="mt-1 text-sm leading-relaxed text-corpo">
                Todo card possui link direto para a matéria correspondente no portal oficial da Câmara
                dos Deputados.
              </p>
              <a
                href="https://www.camara.leg.br"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-corpo hover:underline"
              >
                camara.leg.br <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="rounded-2xl border border-borda bg-superficie p-5">
              <HeartHandshake className="h-6 w-6 text-titulo" />
              <h3 className="mt-3 text-sm font-bold text-titulo">Independência financeira</h3>
              <p className="mt-1 text-sm leading-relaxed text-corpo">
                Mantido por voluntários cívicos, com custo operacional zero e sem qualquer verba
                pública, partidária ou corporativa.
              </p>
            </div>
            <div className="rounded-2xl border border-borda bg-superficie p-5">
              <Scale className="h-6 w-6 text-titulo" />
              <h3 className="mt-3 text-sm font-bold text-titulo">Código e regras abertas</h3>
              <p className="mt-1 text-sm leading-relaxed text-corpo">
                Todo o código-fonte e os critérios de tratamento de dados são públicos e transparentes
                no repositório do projeto.
              </p>
            </div>
          </div>
        </section>

        {/* Compartilhar */}
        <section className="mb-10 rounded-2xl border border-borda bg-superficie p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-titulo">
            Ajude a espalhar a verdade: compartilhe com sua família e amigos.
          </p>
          <div className="mt-4">
            <SocialShareBar />
          </div>
        </section>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-verde-mata px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-verde-bandeira"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para a fiscalização
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
