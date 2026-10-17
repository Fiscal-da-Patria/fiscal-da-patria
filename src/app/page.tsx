"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Info, Loader2, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { Hemiciclo } from "@/components/Hemiciclo";
import { PautaPills } from "@/components/PautaPills";
import { BuscaFiltros } from "@/components/BuscaFiltros";
import { ParlamentarCard } from "@/components/ParlamentarCard";
import { ShareModal, type AlvoCompartilhar } from "@/components/ShareModal";
import { CargoTabs } from "@/components/CargoTabs";
import { GraficoPartidos } from "@/components/GraficoPartidos";
import { PAUTAS, exemploPratico, motivoSemVotoCasa, urlFonteOficial } from "@/lib/pautas";
import type { LinhaPartido } from "@/lib/partidos";
import { bannerOrdem, rotulosOrdem } from "@/lib/parlamentares";
import { mensagemPauta } from "@/lib/share";
import {
  distribuirPorPauta,
  filtrarParlamentares,
  ordenarParlamentares,
  type CargoFiltro,
  type Ordem,
} from "@/lib/parlamentares";
import type { ParlamentarConsolidado } from "@/types/parlamentar";

/** Quantos parlamentares a lista mostra por vez (o resto vem em "Carregar mais"). */
const POR_PAGINA = 20;

export default function HomePage() {
  const [dados, setDados] = useState<ParlamentarConsolidado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pautaSel, setPautaSel] = useState<string>(PAUTAS[0].slug);
  const [ordem, setOrdem] = useState<Ordem>("piores");
  const [busca, setBusca] = useState("");
  const [uf, setUf] = useState("TODOS");
  const [cargo, setCargo] = useState<CargoFiltro>("TODOS");
  /** O que está aberto no modal de compartilhamento (parlamentar ou bancada). */
  const [alvo, setAlvo] = useState<AlvoCompartilhar | null>(null);
  /** Deep link `?deputado=` — destaca o card da pessoa e rola até ele. */
  const [focadoId, setFocadoId] = useState<string | null>(null);
  /** Mostra só quem tem voto registrado na matéria ativa (tira o ruído de "Sem voto"). */
  const [soVotaram, setSoVotaram] = useState(false);
  /** Cards visíveis por vez na lista (o resto vem em "Carregar mais"). */
  const [visiveis, setVisiveis] = useState(POR_PAGINA);

  /* eslint-disable react-hooks/set-state-in-effect -- estado inicial sincronizado com a URL de compartilhamento (?pauta= / ?deputado=) */
  useEffect(() => {
    // Deep links de compartilhamento (Dark Social):
    //   ?pauta=<slug>                 → seleciona a pauta
    //   ?deputado=<id> | ?dep= | ?id= → abre o dossiê (aceita id namespaced ou só o número)
    //   ?busca=<texto> | ?q=          → entra com a lista filtrada
    //   ?cargo=SENADOR                → entra com a aba de cargo já selecionada
    const params = new URLSearchParams(window.location.search);
    const depParam = params.get("deputado") ?? params.get("dep") ?? params.get("id");
    const pautaParam = params.get("pauta");
    const buscaParam = params.get("busca") ?? params.get("q");
    const cargoParam = params.get("cargo");
    if (pautaParam && PAUTAS.some((p) => p.slug === pautaParam)) setPautaSel(pautaParam);
    if (buscaParam) setBusca(buscaParam);
    if (cargoParam === "DEPUTADO" || cargoParam === "SENADOR" || cargoParam === "TODOS") {
      setCargo(cargoParam);
    }

    fetch("/data/parlamentares.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ParlamentarConsolidado[]>;
      })
      .then((d) => {
        setDados(d);
        if (depParam) {
          const alvo = d.find(
            (p) =>
              p.id === depParam ||
              p.id === `camara-${depParam}` ||
              p.id === `senado-${depParam}` ||
              p.id.endsWith(`-${depParam}`),
          );
          if (alvo) {
            // Link antigo de dossiê continua funcionando: filtra pela pessoa,
            // destaca o card e normaliza a URL (?dep= / ?id= → ?deputado=).
            setBusca(alvo.nome);
            setFocadoId(alvo.id);
            sincronizarUrl(alvo.id);
          }
        }
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : "Erro ao carregar dados"))
      .finally(() => setCarregando(false));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const contagens = useMemo<Record<CargoFiltro, number>>(
    () => ({
      TODOS: dados.length,
      DEPUTADO: dados.filter((p) => p.cargo === "DEPUTADO").length,
      SENADOR: dados.filter((p) => p.cargo === "SENADOR").length,
    }),
    [dados],
  );

  /** Quantos parlamentares de cada casa têm voto NESTA matéria (≠ "Sem voto individual"). */
  const comVotoNaPauta = useMemo<Record<CargoFiltro, number>>(
    () => ({
      TODOS: dados.filter((p) => p.votos[pautaSel] !== "NAO_APLICAVEL").length,
      DEPUTADO: dados.filter((p) => p.cargo === "DEPUTADO" && p.votos[pautaSel] !== "NAO_APLICAVEL")
        .length,
      SENADOR: dados.filter((p) => p.cargo === "SENADOR" && p.votos[pautaSel] !== "NAO_APLICAVEL")
        .length,
    }),
    [dados, pautaSel],
  );

  const porCargo = useMemo(
    () => (cargo === "TODOS" ? dados : dados.filter((p) => p.cargo === cargo)),
    [dados, cargo],
  );

  /** Quantos da casa filtrada têm voto registrado nesta matéria + o total da casa. */
  const aplicaveisNaCasa = comVotoNaPauta[cargo];
  const totalDaCasa =
    cargo === "SENADOR"
      ? contagens.SENADOR
      : cargo === "DEPUTADO"
        ? contagens.DEPUTADO
        : contagens.TODOS;
  /** A casa filtrada não votou a matéria (zero votos nominais aplicáveis)? */
  const semVotoNaCasa = aplicaveisNaCasa === 0;

  /**
   * Base efetiva da lista. Quando a casa inteira não votou a matéria, a lista fica
   * vazia: o aviso acima já explica o motivo real, e listar 81 cards de
   * "Sem voto individual" seria ruído, não informação.
   */
  const baseVisivel = useMemo(() => {
    if (semVotoNaCasa) return [];
    return soVotaram ? porCargo.filter((p) => p.votos[pautaSel] !== "NAO_APLICAVEL") : porCargo;
  }, [porCargo, soVotaram, pautaSel, semVotoNaCasa]);

  const distribuicao = useMemo(() => distribuirPorPauta(baseVisivel, pautaSel), [
    baseVisivel,
    pautaSel,
  ]);
  const filtrados = useMemo(
    () => filtrarParlamentares(baseVisivel, busca, uf),
    [baseVisivel, busca, uf],
  );
  const listados = useMemo(
    () => ordenarParlamentares(filtrados, pautaSel, ordem),
    [filtrados, pautaSel, ordem],
  );
  const pautaAtual = PAUTAS.find((p) => p.slug === pautaSel) ?? PAUTAS[0];
  /** Motivo (do dado curado do Senado) de a casa filtrada não ter voto aqui. */
  const motivoCasa = motivoSemVotoCasa(pautaAtual, cargo === "SENADOR" ? "SENADO" : "CAMARA");
  /** Fatia da lista que vai para a tela (paginação de 20 em 20). */
  const listadosVisiveis = useMemo(() => listados.slice(0, visiveis), [listados, visiveis]);

  /**
   * Recorte atual (casa + UF + busca) — o cartão de bancada **declara** isso,
   * para nunca mostrar números que não batem com o que está na tela.
   */
  const recorte = [
    cargo === "SENADOR"
      ? "Senado Federal"
      : cargo === "DEPUTADO"
        ? "Câmara dos Deputados"
        : "Congresso Nacional",
    uf !== "TODOS" ? `UF: ${uf}` : null,
    busca.trim() ? `Busca: ${busca.trim()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const cargoLabel =
    cargo === "SENADOR" ? "senadores" : cargo === "DEPUTADO" ? "deputados" : "parlamentares";

  // Ao trocar a pauta, volta para a ordenação padrão (piores votos primeiro)
  // e reinicia a lista: outra matéria, outra história.
  function selecionarPauta(slug: string) {
    setPautaSel(slug);
    setOrdem("piores");
    setVisiveis(POR_PAGINA);
  }

  // Mantém a URL compartilhável: ?deputado=<id> enquanto um dossiê está aberto.
  function sincronizarUrl(id: string | null) {
    const params = new URLSearchParams(window.location.search);
    for (const chave of ["deputado", "dep", "id"]) params.delete(chave);
    if (id) params.set("deputado", id);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/?${query}` : window.location.pathname);
  }

  function abrirCompartilhar(p: ParlamentarConsolidado) {
    setAlvo({ tipo: "parlamentar", parlamentar: p });
    sincronizarUrl(p.id);
  }

  function abrirCompartilharPartido(linha: LinhaPartido) {
    setAlvo({ tipo: "partido", linha });
  }

  function fecharCompartilhar() {
    setAlvo(null);
    sincronizarUrl(null);
  }

  // Busca sem resultado (nome errado, UF sem deputados etc.): limpa tudo, incluindo a URL.
  function limparFiltros() {
    setBusca("");
    setUf("TODOS");
    setCargo("TODOS");
    setSoVotaram(false);
    setOrdem("piores");
    setVisiveis(POR_PAGINA);
    setFocadoId(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  // Deep link ?deputado=: rola até o card destacado assim que a lista aparece.
  useEffect(() => {
    if (!focadoId) return;
    document
      .querySelector('[data-focado="1"]')
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focadoId, listados]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
        {/*
          Ordem visual no CELULAR (order-*) ≠ ordem no desktop (DOM):
          no celular a lista de parlamentares sobe para antes dos gráficos —
          ninguém deve rolar 3 telas de gráfico para ver o voto de um deputado.
        */}
        <section className="order-1 mb-6 md:order-none">
          <h2 className="text-2xl font-black tracking-tight text-titulo sm:text-3xl">
            Veja como o seu deputado e o seu senador votaram nas pautas que mexem no seu bolso
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-corpo">
            Congresso Nacional completo: 513 deputados federais e 81 senadores, com os votos
            nominais oficiais da Câmara e do Senado em linguagem popular. Cada dossiê traz o link
            para a fonte.
          </p>
          <blockquote
            data-manifesto="1"
            className="mt-4 max-w-2xl border-l-4 border-dourado pl-3 text-sm font-semibold italic leading-relaxed text-titulo"
          >
            &ldquo;Patriota de verdade não idolatra político; patriota de verdade fiscaliza os fatos
            para proteger a sua pátria.&rdquo;{" "}
            <Link
              href="/sobre"
              className="align-baseline text-[11px] font-bold not-italic text-corpo underline decoration-dotted underline-offset-2 hover:text-titulo"
            >
              Sobre nós
            </Link>
          </blockquote>
        </section>

        <section className="order-2 mb-8 md:order-none">
          <PautaPills selecionada={pautaSel} onSelecionar={selecionarPauta} />
          <div className="mt-3 space-y-4">
            <div
              data-pauta-card="1"
              className="rounded-2xl border border-borda bg-superficie p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-corpo">
                  Pauta selecionada
                </p>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    pautaAtual.casa === "SENADO"
                      ? "border border-dourado/60 bg-dourado/15 text-titulo"
                      : "border border-verde-bandeira/40 bg-verde-bandeira/10 text-titulo"
                  }`}
                >
                  {pautaAtual.casa === "SENADO" ? "Votação no Senado" : "Votação na Câmara"}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-titulo">{pautaAtual.rotuloPopular}</h3>
              <p className="mt-1 text-xs text-corpo">{pautaAtual.ementaOficial}</p>
              <p
                data-exemplo-pratico={pautaAtual.slug}
                className="mt-2 rounded-lg border border-dourado/40 bg-dourado/5 px-3 py-2 text-[11px] leading-relaxed text-titulo"
              >
                <strong>No dia a dia:</strong> {exemploPratico(pautaAtual)}
              </p>
              <a
                href={urlFonteOficial(pautaAtual)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-corpo hover:underline"
              >
                {pautaAtual.materia} — fonte oficial <ExternalLink className="h-3 w-3" />
              </a>
              <p className="mt-2 text-xs">
                <Link
                  href={
                    pautaAtual.materia.startsWith("PEC")
                      ? "/poderes#regua"
                      : "/poderes#linha-do-tempo"
                  }
                  data-ajuda-tramitacao={pautaAtual.materia.startsWith("PEC") ? "pec" : "lei"}
                  className="inline-flex items-center gap-1 font-semibold text-corpo underline decoration-dotted underline-offset-2 transition hover:text-titulo"
                >
                  <Info className="h-3 w-3" aria-hidden />
                  {pautaAtual.materia.startsWith("PEC")
                    ? "O que é preciso para aprovar uma PEC?"
                    : "Como uma lei é aprovada?"}
                </Link>
              </p>
              <p className="mt-2 rounded-lg border border-borda bg-fundo-neutro px-3 py-2 text-[11px] text-corpo">
                <strong className="text-titulo">Situação no Senado:</strong>{" "}
                {pautaAtual.senado?.nota ?? "sem verificação registrada."}
              </p>
              <WhatsAppShareButton
                mensagem={mensagemPauta(pautaAtual)}
                rotulo="📲 Compartilhar esta votação"
                titulo={`Enviar no WhatsApp a votação de ${pautaAtual.materia}`}
                className="mt-3 w-full px-3 py-2 text-xs"
              />
            </div>
          </div>
        </section>

        {/* Gráficos (hemiciclo + partidos): no celular vêm DEPOIS da lista (order-7). */}
        <section className="order-7 mb-8 md:order-none">
          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <Hemiciclo
              distribuicao={distribuicao}
              pautaSlug={pautaSel}
              rotulo={
                cargo === "SENADOR"
                  ? "Senado Federal"
                  : cargo === "DEPUTADO"
                    ? "Câmara dos Deputados"
                    : "Congresso Nacional"
              }
            />
            <GraficoPartidos
              parlamentares={filtrados}
              pautaSlug={pautaSel}
              onCompartilhar={abrirCompartilharPartido}
            />
          </div>
        </section>

        <section className="order-3 mb-4 md:order-none">
          <CargoTabs
            selecionado={cargo}
            contagens={contagens}
            extra={{
              TODOS: ` · ${comVotoNaPauta.TODOS} votaram`,
              DEPUTADO: ` · ${comVotoNaPauta.DEPUTADO} votaram`,
              SENADOR: ` · ${comVotoNaPauta.SENADOR} votaram`,
            }}
            onSelecionar={(novo) => {
              setCargo(novo);
              setVisiveis(POR_PAGINA);
            }}
          />
        </section>

        {(semVotoNaCasa || aplicaveisNaCasa < totalDaCasa) && (
          <section
            data-aviso-casa="1"
            className="order-4 mb-4 rounded-xl border border-dourado/50 bg-dourado/5 p-3 md:order-none"
          >
            <p className="text-[11px] leading-relaxed text-corpo">
              <strong className="text-titulo">
                {semVotoNaCasa
                  ? cargo === "SENADOR"
                    ? "O Senado ainda não votou esta matéria."
                    : cargo === "DEPUTADO"
                      ? "A Câmara ainda não votou esta matéria."
                      : "Nenhuma votação nominal registrada nesta matéria."
                  : `Votação parcial nesta casa (${aplicaveisNaCasa} de ${totalDaCasa}).`}
              </strong>{" "}
              {semVotoNaCasa
                ? motivoCasa
                : "Quem não votou aparece como “Sem voto individual” — normalmente porque não estava em exercício na sessão, faltou àquela votação específica ou a matéria segue pendente na outra casa."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Sem votos na casa, o aviso acima já explicou o motivo: nada de botão extra. */}
              {!semVotoNaCasa && (
                <button
                  type="button"
                  onClick={() => {
                    setSoVotaram(true);
                    setVisiveis(POR_PAGINA);
                  }}
                  aria-pressed={soVotaram}
                  data-so-votaram="1"
                  className="rounded-full border border-borda bg-superficie px-2.5 py-1 text-[11px] font-bold text-titulo transition hover:border-dourado"
                >
                  {soVotaram ? "👁️ Mostrando só quem votou" : "👁️ Ver só quem votou nesta matéria"}
                </button>
              )}
              {cargo !== "TODOS" && (
                <button
                  type="button"
                  onClick={() => {
                    setCargo(cargo === "SENADOR" ? "DEPUTADO" : "SENADOR");
                    setVisiveis(POR_PAGINA);
                  }}
                  data-trocar-casa="1"
                  className="rounded-full border border-borda bg-superficie px-2.5 py-1 text-[11px] font-bold text-titulo transition hover:border-dourado"
                >
                  Trocar para {cargo === "SENADOR" ? "Deputados" : "Senadores"} →
                </button>
              )}
            </div>
          </section>
        )}

        <section className="order-5 mb-6 flex flex-col gap-3 md:order-none xl:flex-row xl:items-center">
          <div className="flex-1">
            <BuscaFiltros
              busca={busca}
              uf={uf}
              ordem={ordem}
              rotulos={rotulosOrdem(pautaAtual)}
              onBusca={(valor) => {
                setBusca(valor);
                setVisiveis(POR_PAGINA);
              }}
              onUf={(valor) => {
                setUf(valor);
                setVisiveis(POR_PAGINA);
              }}
              onOrdem={(valor) => {
                setOrdem(valor);
                setVisiveis(POR_PAGINA);
              }}
            />
          </div>
          <WhatsAppShareButton className="w-full px-4 py-2.5 text-sm xl:w-auto" />
        </section>

        <section className="order-6 md:order-none">
          {carregando ? (
            <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-dourado" aria-hidden />
              <p className="text-sm font-medium text-corpo">Carregando os dados das votações…</p>
              <p className="text-xs text-corpo-fraco">Fonte oficial: dadosabertos.camara.leg.br</p>
            </div>
          ) : erro ? (
            <div className="rounded-xl border border-contra/30 bg-superficie p-8 text-center">
              <p className="text-sm font-semibold text-contra">Falha ao carregar os dados: {erro}</p>
              <p className="mt-1 text-xs text-corpo">
                Sem os dados oficiais não há auditoria — recarregue a página para tentar de novo.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-borda bg-superficie px-4 py-2 text-xs font-bold text-titulo shadow-sm transition hover:border-dourado focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Recarregar
              </button>
            </div>
          ) : semVotoNaCasa ? (
            <div
              data-lista-vazia-casa="1"
              className="rounded-xl border border-borda bg-superficie p-10 text-center"
            >
              <p className="text-sm font-semibold text-titulo">
                Nada para listar aqui — e isso já é informação.
              </p>
              <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-corpo">
                {motivoCasa} O Fiscal da Pátria só mostra voto registrado na fonte oficial: nada de
                “voto suposto”. Escolha a outra casa nas abas acima para ver quem votou por lá.
              </p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="rounded-xl border border-borda bg-superficie p-10 text-center">
              <p className="text-sm font-semibold text-titulo">
                Nenhum parlamentar encontrado com esse nome.
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs text-corpo">
                Confira a grafia ou tente só parte do nome, o partido (ex.: PL) ou a sigla do estado. Nada aqui é
                inventado: a lista sai do arquivo oficial da Câmara dos Deputados.
              </p>
              <button
                type="button"
                onClick={limparFiltros}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-verde-bandeira px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Limpar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="rounded-lg border border-dourado/40 bg-dourado/10 px-3 py-1.5 text-xs font-semibold text-titulo">
                  {bannerOrdem(ordem, pautaAtual)}
                </p>
                <p className="shrink-0 text-xs font-medium text-corpo" data-contador="1">
                  Mostrando {listadosVisiveis.length} de {listados.length} parlamentar(es)
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listadosVisiveis.map((p) => (
                  <ParlamentarCard
                    key={p.id}
                    p={p}
                    pauta={pautaAtual}
                    focado={focadoId === p.id}
                    onCompartilhar={() => abrirCompartilhar(p)}
                  />
                ))}
              </div>

              {listadosVisiveis.length < listados.length && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-[11px] text-corpo" aria-live="polite">
                    Faltam {listados.length - listadosVisiveis.length} de {listados.length} para ver
                    todo mundo — carregamos de {POR_PAGINA} em {POR_PAGINA}.
                  </p>
                  <button
                    type="button"
                    data-carregar-mais="1"
                    onClick={() => setVisiveis((v) => v + POR_PAGINA)}
                    className="inline-flex items-center gap-2 rounded-xl bg-verde-mata px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-verde-bandeira focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
                  >
                    ⬇️ Carregar mais {Math.min(POR_PAGINA, listados.length - listadosVisiveis.length)}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <SiteFooter />

      {alvo && (
        <ShareModal
          alvo={alvo}
          pauta={pautaAtual}
          recorte={recorte}
          cargoLabel={cargoLabel}
          onFechar={fecharCompartilhar}
        />
      )}
    </div>
  );
}
