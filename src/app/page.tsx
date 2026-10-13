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
import { DossieModal } from "@/components/DossieModal";
import { CargoTabs } from "@/components/CargoTabs";
import { GraficoPartidos } from "@/components/GraficoPartidos";
import { PAUTAS, urlFonteOficial } from "@/lib/pautas";
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

export default function HomePage() {
  const [dados, setDados] = useState<ParlamentarConsolidado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [pautaSel, setPautaSel] = useState<string>(PAUTAS[0].slug);
  const [ordem, setOrdem] = useState<Ordem>("piores");
  const [busca, setBusca] = useState("");
  const [uf, setUf] = useState("TODOS");
  const [cargo, setCargo] = useState<CargoFiltro>("TODOS");
  const [dossie, setDossie] = useState<ParlamentarConsolidado | null>(null);
  /** Mostra só quem tem voto registrado na matéria ativa (tira o ruído de "Sem voto"). */
  const [soVotaram, setSoVotaram] = useState(false);

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
            setDossie(alvo);
            // Normaliza o link (?dep= / ?id= → ?deputado=) para virar um endereço copiável.
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

  /** Base efetiva da lista: aplica "só quem votou" quando ligado. */
  const baseVisivel = useMemo(
    () => (soVotaram ? porCargo.filter((p) => p.votos[pautaSel] !== "NAO_APLICAVEL") : porCargo),
    [porCargo, soVotaram, pautaSel],
  );

  /** Quantos da casa filtrada têm voto registrado nesta matéria + o total da casa. */
  const aplicaveisNaCasa = comVotoNaPauta[cargo];
  const totalDaCasa =
    cargo === "SENADOR"
      ? contagens.SENADOR
      : cargo === "DEPUTADO"
        ? contagens.DEPUTADO
        : contagens.TODOS;

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

  // Ao trocar a pauta, volta para a ordenação padrão (piores votos primeiro).
  function selecionarPauta(slug: string) {
    setPautaSel(slug);
    setOrdem("piores");
  }

  // Mantém a URL compartilhável: ?deputado=<id> enquanto um dossiê está aberto.
  function sincronizarUrl(id: string | null) {
    const params = new URLSearchParams(window.location.search);
    for (const chave of ["deputado", "dep", "id"]) params.delete(chave);
    if (id) params.set("deputado", id);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `/?${query}` : window.location.pathname);
  }

  function abrirDossie(p: ParlamentarConsolidado) {
    setDossie(p);
    sincronizarUrl(p.id);
  }

  function fecharDossie() {
    setDossie(null);
    sincronizarUrl(null);
  }

  // Busca sem resultado (nome errado, UF sem deputados etc.): limpa tudo, incluindo a URL.
  function limparFiltros() {
    setBusca("");
    setUf("TODOS");
    setCargo("TODOS");
    setSoVotaram(false);
    setOrdem("piores");
    window.history.replaceState(null, "", window.location.pathname);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <section className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-titulo sm:text-3xl">
            Veja como o seu deputado e o seu senador votaram nas pautas que mexem no seu bolso
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-corpo">
            Congresso Nacional completo: 513 deputados federais e 81 senadores, com os votos
            nominais oficiais da Câmara e do Senado em linguagem popular. Cada dossiê traz o link
            para a fonte.
          </p>
        </section>

        <section className="mb-8">
          <PautaPills selecionada={pautaSel} onSelecionar={selecionarPauta} />
          <div className="mt-3 space-y-4">
            <div className="rounded-2xl border border-borda bg-superficie p-5 shadow-sm">
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
              <GraficoPartidos parlamentares={filtrados} pautaSlug={pautaSel} />
            </div>
          </div>
        </section>

        <section className="mb-4">
          <CargoTabs
            selecionado={cargo}
            contagens={contagens}
            extra={{
              TODOS: ` · ${comVotoNaPauta.TODOS} votaram`,
              DEPUTADO: ` · ${comVotoNaPauta.DEPUTADO} votaram`,
              SENADOR: ` · ${comVotoNaPauta.SENADOR} votaram`,
            }}
            onSelecionar={setCargo}
          />
        </section>

        {aplicaveisNaCasa < totalDaCasa && (
          <section
            data-aviso-casa="1"
            className="mb-4 rounded-xl border border-dourado/50 bg-dourado/5 p-3"
          >
            <p className="text-[11px] leading-relaxed text-corpo">
              <strong className="text-titulo">
                {aplicaveisNaCasa === 0
                  ? "Esta casa ainda não votou esta matéria."
                  : `Votação parcial nesta casa (${aplicaveisNaCasa} de ${totalDaCasa}).`}
              </strong>{" "}
              {aplicaveisNaCasa === 0 && pautaAtual.casa === "SENADO"
                ? "A matéria é auditada no Senado — a Câmara não tem votação nominal registrada nesta pauta."
                : "Quem não votou aparece como “Sem voto individual”: o Senado aprova a maioria por votação simbólica, a matéria pode estar pendente na outra casa, ou o parlamentar não estava em exercício na sessão."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSoVotaram(true)}
                aria-pressed={soVotaram}
                data-so-votaram="1"
                className="rounded-full border border-borda bg-superficie px-2.5 py-1 text-[11px] font-bold text-titulo transition hover:border-dourado"
              >
                {soVotaram ? "👁️ Mostrando só quem votou" : "👁️ Ver só quem votou nesta matéria"}
              </button>
              {cargo !== "TODOS" && (
                <button
                  type="button"
                  onClick={() => setCargo(cargo === "SENADOR" ? "DEPUTADO" : "SENADOR")}
                  data-trocar-casa="1"
                  className="rounded-full border border-borda bg-superficie px-2.5 py-1 text-[11px] font-bold text-titulo transition hover:border-dourado"
                >
                  Trocar para {cargo === "SENADOR" ? "Deputados" : "Senadores"} →
                </button>
              )}
            </div>
          </section>
        )}

        <section className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex-1">
            <BuscaFiltros
              busca={busca}
              uf={uf}
              ordem={ordem}
              rotulos={rotulosOrdem(pautaAtual)}
              onBusca={setBusca}
              onUf={setUf}
              onOrdem={setOrdem}
            />
          </div>
          <WhatsAppShareButton className="w-full px-4 py-2.5 text-sm xl:w-auto" />
        </section>

        <section>
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
                <p className="shrink-0 text-xs font-medium text-corpo">
                  {listados.length} parlamentar(es)
                </p>
              </div>
              <p className="mb-3 text-[11px] text-corpo">
                Como o <strong className="text-titulo">Alinhamento Cívico</strong> é calculado?{" "}
                <Link href="/sobre#metodologia" className="font-semibold underline">
                  Ver a metodologia
                </Link>{" "}
                — só entram as votações com voto individual.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listados.map((p) => (
                  <ParlamentarCard
                    key={p.id}
                    p={p}
                    pautaSel={pautaSel}
                    onAbrir={() => abrirDossie(p)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <SiteFooter />

      {dossie && (
        <DossieModal parlamentar={dossie} onFechar={fecharDossie} pautaSel={pautaSel} />
      )}
    </div>
  );
}
