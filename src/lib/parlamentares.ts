import { ROTULOS_FACTUAIS, rotuloFactual } from './pautas';
import type {
  AlinhamentoVoto,
  CargoParlamentar,
  PautaConfig,
  ParlamentarConsolidado,
  VotoCanonico,
} from '../types/parlamentar';

/** Unidades da Federação (com a opção "TODOS"). */
export const UFS = [
  'TODOS',
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

/** Filtro rápido por cargo (abas de alternância no topo da lista). */
export type CargoFiltro = 'TODOS' | CargoParlamentar;

export const ROTULO_CARGO: Record<CargoParlamentar, string> = {
  DEPUTADO: 'Deputado Federal',
  SENADOR: 'Senador da República',
};

/** Rótulo curto do cargo (exibido no card, no formato "Deputado Federal • RJ"). */
export function rotuloCargo(cargo: CargoParlamentar): string {
  return ROTULO_CARGO[cargo];
}

/**
 * Rótulos **genéricos** de alinhamento (fallback sem contexto de pauta).
 *
 * Conformidade editorial: nenhum juízo de valor ("contra/a favor do cidadão").
 * Onde houver pauta, use `rotuloAlinhamento()` para exibir o **fato votado**
 * (ex.: "Rejeitou isenção").
 */
export const ROTULO_ALINHAMENTO: Record<AlinhamentoVoto, string> = {
  FAVORAVEL: 'Apoiou a proposta',
  CONTRA: 'Rejeitou a proposta',
  ABSTENCAO: 'Abstenção',
  AUSENTE: 'Ausente',
  NAO_APLICAVEL: 'Sem voto individual',
};

/** Rótulo exibido para um alinhamento, preferindo o **fato da pauta** quando existir. */
export function rotuloAlinhamento(a: AlinhamentoVoto, pautaSlug?: string): string {
  if (pautaSlug) {
    const factual = rotuloFactual(pautaSlug, a);
    if (factual) return factual;
  }
  return ROTULO_ALINHAMENTO[a];
}

/** Tom visual do voto (para badges compactos e linhas atenuadas). */
export type TomVoto = 'apoio' | 'divergencia' | 'neutro';

/** Resumo compacto de um voto: emoji + verbo curto + tom visual. */
export function resumoVoto(a: AlinhamentoVoto): { texto: string; emoji: string; tom: TomVoto } {
  switch (a) {
    case 'FAVORAVEL':
      return { texto: 'Apoiou', emoji: '🟢', tom: 'apoio' };
    case 'CONTRA':
      return { texto: 'Rejeitou', emoji: '🔴', tom: 'divergencia' };
    case 'ABSTENCAO':
      return { texto: 'Abstenção', emoji: '⚪', tom: 'neutro' };
    case 'NAO_APLICAVEL':
      return { texto: 'Sem voto', emoji: '⚪', tom: 'neutro' };
    default:
      return { texto: 'Ausente', emoji: '⚪', tom: 'neutro' };
  }
}

export const COR_ALINHAMENTO: Record<AlinhamentoVoto, string> = {
  FAVORAVEL: '#1b4d3e',
  CONTRA: '#b91c1c',
  ABSTENCAO: '#64748b',
  AUSENTE: '#cbd5e1',
  NAO_APLICAVEL: '#94a3b8',
};

/** Texto em cor legível sobre o fundo da cor do alinhamento. */
export function textoDaCor(a: AlinhamentoVoto): string {
  return a === 'AUSENTE' || a === 'NAO_APLICAVEL' ? '#0f2f1d' : '#ffffff';
}

/** Distribuição de alinhamento dos parlamentares para uma pauta (alimenta o hemiciclo). */
export function distribuirPorPauta(
  parlamentares: ParlamentarConsolidado[],
  slug: string,
): Record<AlinhamentoVoto, number> {
  const d: Record<AlinhamentoVoto, number> = {
    FAVORAVEL: 0,
    CONTRA: 0,
    ABSTENCAO: 0,
    AUSENTE: 0,
    NAO_APLICAVEL: 0,
  };
  for (const p of parlamentares) {
    d[p.votos[slug] ?? 'AUSENTE'] += 1;
  }
  return d;
}

function semAcento(texto: string): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Busca unificada + filtros de UF e de cargo.
 * A busca acha deputados e senadores pelo nome (ou pelo partido), sem acento.
 */
export function filtrarParlamentares(
  parlamentares: ParlamentarConsolidado[],
  busca: string,
  uf: string,
  cargo: CargoFiltro = 'TODOS',
): ParlamentarConsolidado[] {
  const termo = semAcento(busca.trim());
  return parlamentares.filter((p) => {
    if (cargo !== 'TODOS' && p.cargo !== cargo) return false;
    if (uf !== 'TODOS' && p.uf !== uf) return false;
    if (!termo) return true;
    return (
      semAcento(p.nome).includes(termo) ||
      semAcento(p.partido).includes(termo) ||
      semAcento(p.nomeCivil ?? '').includes(termo)
    );
  });
}

/** Iniciais do nome (para avatar de fallback). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

/** Como o voto bruto aparece na ficha e nas mensagens (auditoria: o que foi registrado). */
export const ROTULO_VOTO_BRUTO: Record<VotoCanonico, string> = {
  SIM: 'SIM',
  NAO: 'NÃO',
  ABSTENCAO: 'Abstenção',
  OBSTRUCAO: 'Obstrução',
  AUSENTE: 'sem voto registrado',
};

/**
 * Detalha **como** o Alinhamento Cívico foi calculado — para ficar visível na ficha.
 *
 * Regra: só contam as votações com **voto individual**.
 *   A favor = 1 ponto · Abstenção = 0,3 · Contra = 0 · Ausente = 0 ·
 *   `NAO_APLICAVEL` (votação simbólica/pendente na casa de origem) **não entra**.
 * Percentual = pontos ÷ votações aplicáveis.
 */
export interface ExplicacaoPontuacao {
  percentual: number;
  pontos: number;
  aplicaveis: number;
  total: number;
  favoraveis: number;
  abstencoes: number;
  contras: number;
  ausentes: number;
  semVoto: number;
  detalhe: string;
}

export function explicarPontuacao(p: ParlamentarConsolidado): ExplicacaoPontuacao {
  const valores = Object.values(p.votos);
  const contar = (alvo: AlinhamentoVoto) => valores.filter((v) => v === alvo).length;

  const favoraveis = contar('FAVORAVEL');
  const abstencoes = contar('ABSTENCAO');
  const contras = contar('CONTRA');
  const ausentes = contar('AUSENTE');
  const semVoto = contar('NAO_APLICAVEL');

  const aplicaveis = favoraveis + abstencoes + contras + ausentes;
  const pontos = favoraveis * 1 + abstencoes * 0.3;
  const percentual = aplicaveis > 0 ? Math.round((pontos / aplicaveis) * 100) : 0;

  const detalhe =
    `Conta: ${favoraveis} a favor × 1 + ${abstencoes} abstenção × 0,3 = ` +
    `${pontos.toString().replace('.', ',')} ponto(s) ÷ ${aplicaveis} votações aplicáveis ` +
    `(de ${valores.length}) = ${percentual}%. ` +
    `${semVoto} pauta(s) sem voto individual não entram na conta; ` +
    `${contras} contra e ${ausentes} ausente(s) valem 0.`;

  return {
    percentual,
    pontos,
    aplicaveis,
    total: valores.length,
    favoraveis,
    abstencoes,
    contras,
    ausentes,
    semVoto,
    detalhe,
  };
}

/**
 * Abrevia números grandes em linguagem popular:
 *   10.714.913 → "10,7M" · 1.492.047 → "1,5M" · 640.918 → "641k" · 950 → "950".
 * O valor exato continua no `title`/`aria-label` (auditoria) e no JSON.
 */
export function numeroCompacto(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n >= 1_000_000) {
    const milhoes = Math.round((n / 1_000_000) * 10) / 10;
    return `${milhoes.toString().replace('.', ',')}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

/** Critérios de ordenação da listagem. */
export type Ordem = 'piores' | 'melhores' | 'intercalado' | 'maisVotados';

/** Rótulos do seletor "Ordenar por" (curtos e escaneáveis). */
export const ROTULOS_ORDEM: Record<Ordem, string> = {
  piores: '⚠️ Divergentes primeiro (Padrão)',
  intercalado: '⚖️ Placar equilibrado (Intercalado)',
  melhores: '✅ Favoráveis primeiro',
  maisVotados: '🗳️ Mais votados nas urnas',
};

/** Banner contextual exibido acima da listagem (factual, sem juízo de valor). */
export const BANNER_ORDEM: Record<Ordem, string> = {
  piores:
    'Mostrando primeiro os parlamentares com posicionamento contrário à proposta (ordenados pelos mais votados).',
  melhores:
    'Mostrando primeiro os parlamentares com posicionamento favorável à proposta (ordenados pelos mais votados).',
  intercalado:
    'Mostrando posições favoráveis e divergentes de forma intercalada, sempre começando pelos mais votados.',
  maisVotados: 'Mostrando os mais votados na eleição (dados oficiais do TSE).',
};

/**
 * Banner **pauta-aware**: nas pautas invertidas (ex.: PEC 3/2021 — Blindagem) o
 * sentido de "contrário à proposta" se inverte; ali o banner cita o **fato
 * votado** da pauta para não induzir a erro.
 */
export function bannerOrdem(ordem: Ordem, pauta?: PautaConfig): string {
  const rotulos = pauta ? ROTULOS_FACTUAIS[pauta.slug] : undefined;
  if (pauta?.invertida && rotulos && (ordem === 'piores' || ordem === 'melhores')) {
    const fato = ordem === 'piores' ? rotulos.divergente : rotulos.apoio;
    return `Mostrando primeiro quem ${fato} (ordenados pelos mais votados).`;
  }
  return BANNER_ORDEM[ordem];
}

/** Rótulos do seletor de ordenação, também pauta-aware na pauta invertida. */
export function rotulosOrdem(pauta?: PautaConfig): Record<Ordem, string> {
  const rotulos = pauta ? ROTULOS_FACTUAIS[pauta.slug] : undefined;
  if (pauta?.invertida && rotulos) {
    return {
      ...ROTULOS_ORDEM,
      piores: `⚠️ ${rotulos.divergente} primeiro`,
      melhores: `✅ ${rotulos.apoio} primeiro`,
    };
  }
  return ROTULOS_ORDEM;
}

/**
 * Gravidade do voto na cascata (1º critério):
 *   CONTRA → A FAVOR → (abstenção / ausente / sem voto individual).
 * `NAO_APLICAVEL` vai para o fim: não existe voto individual a julgar.
 */
const GRUPO_PIORES: Record<AlinhamentoVoto, number> = {
  CONTRA: 0,
  FAVORAVEL: 1,
  ABSTENCAO: 2,
  AUSENTE: 2,
  NAO_APLICAVEL: 3,
};

/** Mesma cascata, invertida para "melhores votos primeiro". */
const GRUPO_MELHORES: Record<AlinhamentoVoto, number> = {
  FAVORAVEL: 0,
  CONTRA: 1,
  ABSTENCAO: 2,
  AUSENTE: 2,
  NAO_APLICAVEL: 3,
};

function alinhamentoNaPauta(p: ParlamentarConsolidado, slug: string): AlinhamentoVoto {
  return p.votos[slug] ?? 'AUSENTE';
}

/**
 * Ordena a listagem de parlamentares (Câmara + Senado juntos).
 *
 * Cascata para `piores` / `melhores` (item 3 do PRD):
 *   1º Gravidade do voto (CONTRA → A FAVOR → abstenção/ausente/sem voto individual);
 *   2º `votosEleicao` **decrescente** — as figuras nacionais de peso no topo;
 *   3º nome A-Z.
 *
 * `maisVotados`: ignora a gravidade e mostra os mais votados da eleição (2º critério isolado).
 * `intercalado`: alterna 1 CONTRA / 1 A FAVOR (mais votados de cada lado), depois o resto.
 */
export function ordenarParlamentares(
  parlamentares: ParlamentarConsolidado[],
  pautaSlug: string,
  ordem: Ordem,
): ParlamentarConsolidado[] {
  const porNome = (a: ParlamentarConsolidado, b: ParlamentarConsolidado) =>
    a.nome.localeCompare(b.nome, 'pt-BR');

  const porVotos = (a: ParlamentarConsolidado, b: ParlamentarConsolidado) =>
    (b.votosEleicao ?? 0) - (a.votosEleicao ?? 0);

  if (ordem === 'maisVotados') {
    return [...parlamentares].sort((a, b) => porVotos(a, b) || porNome(a, b));
  }

  // Intercalado: 1 CONTRA, 1 A FAVOR, 1 CONTRA, 1 A FAVOR… (sempre pelos mais
  // votados de cada lado) — dá visibilidade às duas pontas da votação.
  if (ordem === 'intercalado') {
    const grupo = (alvo: AlinhamentoVoto) =>
      parlamentares
        .filter((p) => alinhamentoNaPauta(p, pautaSlug) === alvo)
        .sort((a, b) => porVotos(a, b) || porNome(a, b));

    const contras = grupo('CONTRA');
    const favoraveis = grupo('FAVORAVEL');
    const restantes = parlamentares
      .filter((p) => !['CONTRA', 'FAVORAVEL'].includes(alinhamentoNaPauta(p, pautaSlug)))
      .sort((a, b) => porVotos(a, b) || porNome(a, b));

    const saida: ParlamentarConsolidado[] = [];
    const max = Math.max(contras.length, favoraveis.length);
    for (let i = 0; i < max; i++) {
      if (contras[i]) saida.push(contras[i]);
      if (favoraveis[i]) saida.push(favoraveis[i]);
    }
    return [...saida, ...restantes];
  }

  const grupos = ordem === 'melhores' ? GRUPO_MELHORES : GRUPO_PIORES;
  return [...parlamentares].sort((a, b) => {
    const ga = grupos[alinhamentoNaPauta(a, pautaSlug)];
    const gb = grupos[alinhamentoNaPauta(b, pautaSlug)];
    if (ga !== gb) return ga - gb;
    return porVotos(a, b) || porNome(a, b);
  });
}
