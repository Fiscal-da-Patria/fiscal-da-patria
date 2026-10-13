import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FilePlus2,
  Filter,
  Gavel,
  Info,
  Landmark,
  ListChecks,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Entenda os Poderes | Fiscal da Pátria",
  description:
    "Os três Poderes da República, a régua dos votos (PEC exige 308/49; lei complementar 257/41) e a linha do tempo de uma lei — tudo em linguagem popular. Entenda por que o Fiscal da Pátria fiscaliza o Poder Legislativo.",
};

interface Poder {
  id: "legislativo" | "executivo" | "judiciario";
  titulo: string;
  quem: string;
  oQueFaz: string;
  lembrete: string;
  destaque?: boolean;
}

const PODERES: Poder[] = [
  {
    id: "legislativo",
    titulo: "Poder Legislativo — Quem cria as regras e mexe no seu bolso",
    quem: "Deputados Federais (513) e Senadores (81)",
    oQueFaz:
      "Cria e vota leis, define impostos, aprova o orçamento e fiscaliza o governo.",
    lembrete: "🎯 O foco do Fiscal da Pátria: é aqui que seu bolso é decidido!",
    destaque: true,
  },
  {
    id: "executivo",
    titulo: "Poder Executivo — Quem administra e executa",
    quem: "Presidente da República, Governadores e Prefeitos.",
    oQueFaz:
      "Aplica o orçamento público, gerencia hospitais, escolas, rodovias e políticas de estado.",
    lembrete: "Não cria leis nem impostos sozinho: depende do aval do Legislativo.",
  },
  {
    id: "judiciario",
    titulo: "Poder Judiciário — Quem julga e fiscaliza as regras",
    quem: "Tribunais de Justiça e Cortes Superiores (STF, STJ).",
    oQueFaz:
      "Julga conflitos, garante a Constituição e aplica as leis criadas pelo Congresso.",
    lembrete:
      "Julga de acordo com as leis aprovadas pelos deputados e senadores que você elegeu.",
  },
];

const ICONES: Record<Poder["id"], typeof Scale> = {
  legislativo: Scale,
  executivo: Building2,
  judiciario: Gavel,
};

/**
 * Quóruns constitucionais — **conferidos no texto da Constituição**
 * (arts. 47, 60, §§ 2º e 3º, e 69):
 *   PEC → 3/5 de 513 = 308 | 3/5 de 81 = 49 (2 turnos, sem sanção nem veto)
 *   PLP → metade + 1 = 257 (513) | 41 (81)
 *   PL  → maioria dos votos, presente a maioria absoluta (art. 47)
 * A conta é sobre o **total de cadeiras**, não sobre os presentes.
 */
interface Quorum {
  id: "pec" | "plp" | "pl";
  sigla: string;
  nome: string;
  exemplos: string;
  destaque: string;
  camara: string;
  camaraNota: string;
  senado: string;
  senadoNota: string;
  pontos: string[];
  base: string;
  icone: typeof Scale;
}

const QUORUNS: Quorum[] = [
  {
    id: "pec",
    sigla: "PEC",
    nome: "Proposta de Emenda à Constituição",
    exemplos: "Ex.: Fim da Blindagem (PEC 3/2021) e fim da Escala 6x1 (PEC 221/2019)",
    destaque: "Regra máxima: 3/5 dos votos",
    camara: "308",
    camaraNota: "de 513 deputados",
    senado: "49",
    senadoNota: "de 81 senadores",
    pontos: [
      "Precisa ser votada e aprovada em 2 turnos em cada Casa — dobra o tempo e o risco.",
      "O Presidente não pode vetar nem sancionar: é promulgada direto pelo Congresso.",
      "Faltou 1 voto? A proposta é arquivada. Não existe “quase virou lei”.",
    ],
    base: "Constituição, art. 60, §§ 2º e 3º",
    icone: Landmark,
  },
  {
    id: "plp",
    sigla: "PLP",
    nome: "Projeto de Lei Complementar",
    exemplos: "Ex.: regulamentação da reforma tributária (impostos)",
    destaque: "Maioria absoluta: metade + 1",
    camara: "257",
    camaraNota: "de 513 deputados",
    senado: "41",
    senadoNota: "de 81 senadores",
    pontos: [
      "Passa por 1 turno em cada Casa (regra geral).",
      "Depois vai para sanção ou veto do Presidente.",
      "É o caminho de temas que a Constituição mandou detalhar em lei específica.",
    ],
    base: "Constituição, art. 69",
    icone: Scale,
  },
  {
    id: "pl",
    sigla: "PL",
    nome: "Projeto de Lei Ordinária",
    exemplos: "Ex.: Igualdade Salarial (PL 1085/2023) e teto dos juros do cartão",
    destaque: "Maioria simples: quem tem mais votos",
    camara: "Maioria",
    camaraNota: "dos presentes (mínimo de 257 para a sessão abrir)",
    senado: "Maioria",
    senadoNota: "dos presentes (mínimo de 41 para a sessão abrir)",
    pontos: [
      "Vence quem tiver mais votos SIM do que NÃO entre os presentes; abstenção não é voto.",
      "Passa por 1 turno em cada Casa (em geral) e vai para sanção ou veto.",
      "É o tipo mais comum — e o mais fácil de aprovar às pressas.",
    ],
    base: "Constituição, art. 47",
    icone: Gavel,
  },
];

/** As 5 etapas do funil legislativo (a “linha do tempo” de uma lei). */
interface Etapa {
  n: number;
  id: string;
  titulo: string;
  sub: string;
  icone: typeof Scale;
  pontos: string[];
}

const ETAPAS: Etapa[] = [
  {
    n: 1,
    id: "proposta",
    titulo: "A proposta nasce",
    sub: "O nascimento",
    icone: FilePlus2,
    pontos: [
      "Quem apresenta: deputado, senador, Presidente da República ou projeto de iniciativa popular (com assinaturas de eleitores).",
      "Nada acontece escondido: a proposta ganha um número oficial (PL, PLP ou PEC) e fica pública.",
    ],
  },
  {
    n: 2,
    id: "comissoes",
    titulo: "O filtro das comissões",
    sub: "Onde os projetos travam",
    icone: Filter,
    pontos: [
      "Grupos menores de parlamentares analisam o tema antes do plenário: saúde, finanças, educação e por aí.",
      "A CCJ (Comissão de Constituição e Justiça) pode barrar proposta inconstitucional — e o projeto morre ali, sem votação no plenário.",
    ],
  },
  {
    n: 3,
    id: "plenario",
    titulo: "O plenário da Câmara",
    sub: "513 deputados · o foco do Fiscal",
    icone: Users,
    pontos: [
      "Votação aberta no painel eletrônico: SIM, NÃO ou ABSTENÇÃO — cada voto fica registrado com o nome de quem votou.",
      "É exatamente esse voto individual que o Fiscal da Pátria audita, com link para a fonte oficial.",
      "Aprovado, segue para o Senado Federal.",
    ],
  },
  {
    n: 4,
    id: "senado",
    titulo: "O Senado Federal",
    sub: "81 senadores · Casa revisora",
    icone: Landmark,
    pontos: [
      "Rejeitou? A proposta é arquivada.",
      "Aprovou sem mudanças? Vai para o Presidente da República.",
      "Mudou o texto? Volta para a Câmara, que dá a palavra final sobre o que mudou.",
    ],
  },
  {
    n: 5,
    id: "sancao",
    titulo: "Sanção, veto e a última palavra",
    sub: "O fim (ou não) da linha",
    icone: Gavel,
    pontos: [
      "O Presidente sanciona (vira lei) ou veta — total ou parcialmente.",
      "Veto derrubado: o Congresso se reúne em sessão conjunta e, por maioria absoluta de deputados e senadores, faz a lei valer mesmo contra a vontade do governo.",
      "Promulgada e publicada, a lei passa a valer para todo mundo — e a conta chega no seu bolso.",
    ],
  },
];

export default function PoderesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-corpo transition hover:text-titulo"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a fiscalização
        </Link>

        {/* Hero */}
        <header className="mt-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-dourado/40 bg-dourado/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-corpo">
            <Landmark className="h-3.5 w-3.5" /> Educação Cívica
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-titulo sm:text-4xl">
            Entenda os Poderes
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-corpo">
            O Brasil funciona com <strong className="text-titulo">três Poderes</strong> que dividem
            as tarefas para ninguém mandar sozinho. Um cria as regras, outro coloca em prática e o
            terceiro julga — e é essa divisão que protege o seu bolso.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-corpo">
            Sem juridiquês: aqui está quem faz o quê, com quem, e por que o{" "}
            <strong className="text-titulo">Fiscal da Pátria</strong> fiscaliza o{" "}
            <strong className="text-titulo">Poder Legislativo</strong>.
          </p>
        </header>

        {/* Diagrama dos 3 Poderes */}
        <section className="mt-10">
          <h2 className="sr-only">Os três Poderes da República</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PODERES.map((poder) => {
              const Icone = ICONES[poder.id];
              return (
                <article
                  key={poder.id}
                  data-poder={poder.id}
                  className={`flex flex-col rounded-2xl border bg-superficie p-5 shadow-sm ${
                    poder.destaque
                      ? "border-2 border-dourado ring-2 ring-verde-bandeira/20 md:-mt-2 md:mb-2"
                      : "border-borda"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl ${
                      poder.destaque ? "bg-dourado text-verde-mata" : "bg-trilha text-titulo"
                    }`}
                  >
                    <Icone className="h-6 w-6" aria-hidden />
                  </span>

                  <h3 className="mt-3 text-base font-black leading-snug text-titulo">
                    {poder.titulo}
                  </h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-corpo">
                        <Users className="h-3.5 w-3.5" aria-hidden /> Quem compõe
                      </p>
                      <p className="mt-0.5 text-corpo">{poder.quem}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-corpo">
                        <ListChecks className="h-3.5 w-3.5" aria-hidden /> O que faz
                      </p>
                      <p className="mt-0.5 text-corpo">{poder.oQueFaz}</p>
                    </div>
                  </div>

                  <p
                    className={`mt-4 rounded-xl border p-3 text-[12px] font-semibold leading-snug ${
                      poder.destaque
                        ? "border-dourado/60 bg-dourado/10 text-titulo"
                        : "border-borda bg-fundo-neutro text-corpo"
                    }`}
                  >
                    {poder.lembrete}
                  </p>

                  {poder.destaque && (
                    <Link
                      href="/"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-verde-mata px-3 py-2 text-xs font-bold text-white transition hover:bg-verde-bandeira"
                    >
                      Ver como cada um votou
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Câmara x Senado */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-bold text-titulo sm:text-2xl">
            <Landmark className="h-5 w-5 shrink-0 text-dourado" /> Câmara e Senado: quem representa o
            quê
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-corpo">
            O Legislativo federal tem duas casas. As duas votam as mesmas leis — mas representam
            coisas diferentes.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <article
              data-casa="camara"
              className="rounded-2xl border border-borda bg-superficie p-5 shadow-sm"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-verde-bandeira/40 bg-verde-bandeira/10 px-3 py-1 text-[11px] font-bold text-titulo">
                <Users className="h-3.5 w-3.5" aria-hidden /> Câmara dos Deputados
              </span>
              <h3 className="mt-3 text-lg font-bold text-titulo">
                Deputados Federais — a voz do povo
              </h3>
              <p className="mt-1 text-sm text-corpo">
                São <strong className="text-titulo">513</strong> no total. O número por estado{" "}
                <strong className="text-titulo">varia conforme a população</strong>: São Paulo elege
                muitos, Roraima elege poucos. Onde tem mais gente, tem mais voz.
              </p>
            </article>

            <article
              data-casa="senado"
              className="rounded-2xl border border-borda bg-superficie p-5 shadow-sm"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-dourado/50 bg-dourado/10 px-3 py-1 text-[11px] font-bold text-titulo">
                <Landmark className="h-3.5 w-3.5" aria-hidden /> Senado Federal
              </span>
              <h3 className="mt-3 text-lg font-bold text-titulo">Senadores — a voz dos estados</h3>
              <p className="mt-1 text-sm text-corpo">
                São <strong className="text-titulo">3 por estado</strong>, sempre —{" "}
                <strong className="text-titulo">81</strong> no total. Assim o Acre tem o mesmo peso
                de São Paulo, mantendo o{" "}
                <strong className="text-titulo">equilíbrio da Federação</strong>.
              </p>
            </article>
          </div>
        </section>

        {/* Régua dos votos */}
        <section id="regua" data-regua="1" className="mt-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-bold text-titulo sm:text-2xl">
            <ListChecks className="h-5 w-5 shrink-0 text-dourado" aria-hidden /> A régua dos votos:
            quantos votos valem uma decisão?
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-corpo">
            Nem toda lei exige o mesmo número de votos: quanto maior a mudança, mais alta a barreira. É
            por isso que uma <strong className="text-titulo">PEC</strong> trava muito mais fácil do que
            um projeto comum.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {QUORUNS.map((quorum) => {
              const Icone = quorum.icone;
              return (
                <article
                  key={quorum.id}
                  data-quorum={quorum.id}
                  className="flex flex-col rounded-2xl border border-borda bg-superficie p-5 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dourado/50 bg-dourado/10 text-titulo">
                      <Icone className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full border border-dourado/50 bg-dourado/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-titulo">
                      {quorum.sigla}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-black leading-snug text-titulo">
                    {quorum.nome}
                  </h3>
                  <p className="mt-1 text-[11px] leading-snug text-corpo">{quorum.exemplos}</p>

                  <p
                    data-quorum-regra={quorum.sigla}
                    className="mt-3 rounded-lg border border-dourado/50 bg-dourado/10 px-2.5 py-1.5 text-[11px] font-bold text-titulo"
                  >
                    {quorum.destaque}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div
                      data-quorum-camara={quorum.camara}
                      className="rounded-xl border border-borda bg-fundo-neutro p-2.5 text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-corpo">
                        Câmara
                      </p>
                      <p className="text-xl font-black leading-tight text-titulo">
                        {quorum.camara}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-snug text-corpo">
                        {quorum.camaraNota}
                      </p>
                    </div>
                    <div
                      data-quorum-senado={quorum.senado}
                      className="rounded-xl border border-borda bg-fundo-neutro p-2.5 text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-corpo">
                        Senado
                      </p>
                      <p className="text-xl font-black leading-tight text-titulo">
                        {quorum.senado}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-snug text-corpo">
                        {quorum.senadoNota}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 flex-1 list-disc space-y-2 pl-4 text-xs leading-relaxed text-corpo">
                    {quorum.pontos.map((ponto) => (
                      <li key={ponto}>{ponto}</li>
                    ))}
                  </ul>

                  <p
                    data-quorum-base={quorum.id}
                    className="mt-3 border-t border-borda pt-2 text-[10px] font-semibold text-corpo"
                  >
                    {quorum.base}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="mt-4 rounded-2xl border border-borda bg-superficie p-4 text-xs leading-relaxed text-corpo shadow-sm">
            <Info className="mr-1 inline h-3.5 w-3.5 align-middle text-dourado" aria-hidden />
            <strong className="text-titulo">Como a conta é feita:</strong> sobre o{" "}
            <strong className="text-titulo">total de cadeiras</strong> (513 na Câmara e 81 no Senado),
            não sobre quem apareceu. Cadeira vazia ou parlamentar ausente{" "}
            <strong className="text-titulo">não</strong> derruba a barra — numa PEC, um voto pode
            decidir.{" "}
            <a
              href="https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-titulo underline"
            >
              Confira o texto na Constituição Federal{" "}
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </p>
        </section>

        {/* Linha do tempo da tramitação */}
        <section id="linha-do-tempo" data-tramitacao="1" className="mt-12 scroll-mt-24">
          <h2 className="flex items-center gap-2 text-xl font-bold text-titulo sm:text-2xl">
            <FilePlus2 className="h-5 w-5 shrink-0 text-dourado" aria-hidden /> A linha do tempo de
            uma lei (o funil legislativo)
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-corpo">
            Da ideia até virar lei, a proposta passa por 5 etapas — e em cada uma ela pode morrer. É
            esse caminho que o Fiscal da Pátria acompanha, voto a voto.
          </p>

          <ol className="relative mt-6 space-y-6 md:flex md:gap-3 md:space-y-0">
            <span
              aria-hidden
              className="absolute left-[19px] top-3 h-[calc(100%-1.5rem)] w-0.5 rounded-full bg-trilha md:left-0 md:top-[19px] md:h-0.5 md:w-full"
            />
            {ETAPAS.map((etapa) => {
              const Icone = etapa.icone;
              return (
                <li
                  key={etapa.id}
                  data-etapa={etapa.n}
                  className="relative flex gap-4 md:flex-1 md:flex-col md:gap-3"
                >
                  <span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-dourado bg-superficie text-titulo shadow-sm">
                    <Icone className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex-1 rounded-2xl border border-borda bg-superficie p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-corpo">
                      Passo {etapa.n} · {etapa.sub}
                    </p>
                    <h3 className="mt-1 text-sm font-black leading-snug text-titulo">
                      {etapa.titulo}
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-corpo">
                      {etapa.pontos.map((ponto) => (
                        <li key={ponto}>{ponto}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 rounded-2xl border border-borda bg-superficie p-4 text-xs leading-relaxed text-corpo shadow-sm">
            <strong className="text-titulo">Dica de fiscal:</strong> quando um projeto empaca, o motivo
            costuma estar no passo 2 (comissões) ou no passo 4 (o Senado devolvendo o texto à Câmara).
            A tramitação oficial de qualquer matéria está em{" "}
            <strong className="text-titulo">camara.leg.br</strong> e{" "}
            <strong className="text-titulo">senado.leg.br</strong> — é de lá que sai cada voto deste
            site.
          </p>
        </section>

        {/* Fechamento */}
        <section className="mt-10 rounded-2xl border border-borda bg-superficie p-5 shadow-sm">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-corpo">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-dourado" aria-hidden />
            <span>
              <strong className="text-titulo">Por que fiscalizamos o Legislativo?</strong> Porque é
              ali que nascem os impostos, o orçamento e as regras que chegam ao seu prato e ao seu
              contracheque. O Fiscal da Pátria audita as <strong>votações nominais</strong> do
              Congresso — os votos individuais, registrados e públicos de cada deputado e senador —
              direto das fontes oficiais.{" "}
              <Link href="/sobre#metodologia" className="font-semibold underline">
                Veja a metodologia
              </Link>
              .
            </span>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
