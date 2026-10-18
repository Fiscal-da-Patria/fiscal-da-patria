/**
 * Mensagens e URLs de compartilhamento (Dark Social) — Fiscal da Pátria.
 * Módulo puro (sem JSX): importável por componentes e por testes.
 */
import { ROTULO_VOTO_BRUTO } from './parlamentares';
import { TOP_BANCADAS, resumoPartido, type LinhaPartido } from './partidos';
import { rotuloFactual } from './pautas';
import type { AlinhamentoVoto, VotoCanonico } from '../types/parlamentar';

/** Domínio oficial do projeto. */
export const SITE_URL = "https://fiscaldapatria.org.br";

/** Mensagem oficial de compartilhamento (WhatsApp / Telegram). */
export const MENSAGEM_OFICIAL = [
  "Gente, vocês viram isso aqui? 🚨🇧🇷",
  "Quem é patriota de verdade tem que ver antes que sumam com isso!",
  "",
  "Painel oficial mostra quem votou contra zerar o imposto da comida e quem votou para proteger político de investigação. Só fatos da Câmara!",
  "",
  "Dá uma olhada no seu deputado: 👇",
  SITE_URL,
].join("\n");

/** Texto curto para o X (Twitter) — termina com quebra de linha, conforme especificado. */
export const TEXTO_X =
  "Gente, vocês viram isso aqui? 🚨🇧🇷 O painel oficial que mostra como cada deputado votou na comida, no IR e na blindagem de políticos:\n";

/** Link de compartilhamento do WhatsApp (encoding seguro). */
export function urlWhatsApp(mensagem: string = MENSAGEM_OFICIAL): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
}

/** Link de compartilhamento do Telegram. */
export function urlTelegram(mensagem: string = MENSAGEM_OFICIAL, url: string = SITE_URL): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(mensagem)}`;
}

/** Link de compartilhamento do X (Twitter). */
export function urlX(texto: string = TEXTO_X, url: string = SITE_URL): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`;
}

/** Deep link que abre o dossiê de um parlamentar (id namespaced: `camara-74646`). */
export function urlDeputado(id: string): string {
  return `${SITE_URL}/?deputado=${encodeURIComponent(id)}`;
}

/** Deep link que abre a página com a PAUTA como assunto central. */
export function urlPauta(slug: string): string {
  return `${SITE_URL}/?pauta=${encodeURIComponent(slug)}`;
}

/** Deep link que abre o dossiê JÁ posicionado na pauta (matéria em destaque). */
export function urlParlamentarNaPauta(id: string, slug: string): string {
  return `${SITE_URL}/?deputado=${encodeURIComponent(id)}&pauta=${encodeURIComponent(slug)}`;
}

/** Filtros que definem o recorte dos números exibidos no cartão. */
export interface FiltrosRecorte {
  cargo?: string;
  uf?: string;
  busca?: string;
}

/**
 * Deep link da pauta **com o mesmo recorte** que gerou os números do cartão.
 * Sem isso, o destinatário abriria outra base e veria números diferentes.
 */
export function urlRecorte(slug: string, filtros: FiltrosRecorte = {}): string {
  const params = new URLSearchParams({ pauta: slug });
  if (filtros.cargo && filtros.cargo !== "TODOS") params.set("cargo", filtros.cargo);
  if (filtros.uf && filtros.uf !== "TODOS") params.set("uf", filtros.uf);
  if (filtros.busca?.trim()) params.set("busca", filtros.busca.trim());
  return `${SITE_URL}/?${params.toString()}`;
}

/**
 * Mensagem com a PAUTA como assunto central — para o grupo da família:
 * fala da matéria (ex.: comida sem imposto) e convida a ver todos os votos.
 */
export function mensagemPauta(pauta: {
  slug: string;
  rotuloPopular: string;
  materia: string;
}): string {
  return [
    `🚨 Votação no Congresso: ${pauta.rotuloPopular}`,
    "",
    `Matéria: ${pauta.materia}. Veja o voto de cada deputado e senador nesta matéria — com a fonte oficial no dossiê (Câmara e Senado).`,
    "",
    "Confira aqui: 👇",
    urlPauta(pauta.slug),
  ].join("\n");
}

/**
 * Mensagem com a PAUTA no centro **e** o voto de um parlamentar específico:
 * "sobre a comida sem imposto, o deputado X votou CONTRA o cidadão".
 */
export function mensagemParlamentarNaPauta(
  p: { id: string; nome: string; partido: string; uf: string; cargo: string },
  pauta: { slug: string; rotuloPopular: string; materia: string },
  voto: { alinhamento: AlinhamentoVoto; bruto?: VotoCanonico },
): string {
  const cargo = p.cargo === "SENADOR" ? "senador" : "deputado federal";
  // Rótulo FACTUAL da pauta (conformidade editorial: sem "contra/a favor do cidadão").
  const posicao =
    rotuloFactual(pauta.slug, voto.alinhamento) ??
    (voto.alinhamento === "ABSTENCAO" ? "se absteve" : "não tem voto individual registrado");

  const linhas = [
    `🚨 ${pauta.rotuloPopular} (${pauta.materia})`,
    "",
    `Nesta votação, ${p.nome} (${p.partido}-${p.uf}), ${cargo}: ${posicao}.`,
  ];
  if (voto.bruto && voto.alinhamento !== "NAO_APLICAVEL") {
    linhas.push(`Voto registrado na fonte oficial: ${ROTULO_VOTO_BRUTO[voto.bruto]}.`);
  }
  linhas.push("", "Veja o voto aqui: 👇", urlParlamentarNaPauta(p.id, pauta.slug));
  return linhas.join("\n");
}

/** Mensagem focada em um parlamentar (deep link). */
export function mensagemParlamentar(p: {
  id: string;
  nome: string;
  partido: string;
  uf: string;
  cargo: string;
}): string {
  const cargo = p.cargo === "SENADOR" ? "senador" : "deputado federal";
  return [
    `Olha como ${p.nome} (${p.partido}-${p.uf}), ${cargo}, votou nas pautas que mexem no seu bolso. 👀`,
    "",
    "Cada card mostra a matéria e o voto registrado, com link para a fonte oficial.",
    "",
    "Confira: 👇",
    urlDeputado(p.id),
  ].join("\n");
}

/**
 * Texto para compartilhar o cartão de **uma bancada** (partido).
 *
 * Factual: contagem + rótulo do voto + recorte + link já com o recorte aplicado
 * (o mesmo que gerou os números do cartão).
 */
export function mensagemPartido(
  linha: { partido: string },
  resumo: { contagem: string; rotulo: string } | null,
  pauta: { slug: string; rotuloPopular: string; materia: string },
  recorte: string,
  link: string,
): string {
  const manchete = resumo
    ? `${resumo.contagem} (${resumo.rotulo})`
    : "sem votação nominal registrada";
  return [
    `🚨 ${linha.partido} na votação de ${pauta.materia}: ${manchete}.`,
    "",
    `Matéria: ${pauta.materia} — ${pauta.rotuloPopular}.`,
    `Recorte: ${recorte}.`,
    "",
    "Veja o voto de cada parlamentar: 👇",
    link,
  ].join("\n");
}

/**
 * Texto para compartilhar o cartão do **top 5 de bancadas**.
 *
 * Factual: lista as maiores bancadas do recorte com a manchete "X de N"
 * (sempre sobre quem tinha voto individual) e o link do mesmo recorte.
 */
export function mensagemTop5(
  linhas: LinhaPartido[],
  pauta: { slug: string; rotuloPopular: string; materia: string },
  recorte: string,
  link: string,
): string {
  const top = linhas.slice(0, TOP_BANCADAS);
  if (top.length === 0) return mensagemPauta(pauta);

  return [
    `🚨 Top ${top.length} maiores bancadas — ${pauta.rotuloPopular}`,
    "",
    ...top.map((linha) => {
      const resumo = resumoPartido(linha, pauta.slug);
      return `• ${linha.partido}: ${
        resumo ? `${resumo.contagem} (${resumo.rotulo})` : "sem votação nominal"
      }`;
    }),
    "",
    `Matéria: ${pauta.materia}.`,
    `Recorte: ${recorte}.`,
    "",
    "Veja como cada partido votou: 👇",
    link,
  ].join("\n");
}
