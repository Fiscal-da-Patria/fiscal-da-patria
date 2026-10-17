import { rotuloAlinhamento } from './parlamentares';
import type { AlinhamentoVoto, ParlamentarConsolidado } from '../types/parlamentar';

/** Ordem canônica dos segmentos (gráfico, legenda e cartão compartilhável). */
export const ORDEM_VOTOS: AlinhamentoVoto[] = [
  'FAVORAVEL',
  'CONTRA',
  'ABSTENCAO',
  'AUSENTE',
  'NAO_APLICAVEL',
];

export interface LinhaPartido {
  partido: string;
  contagem: Record<AlinhamentoVoto, number>;
  /** Bancada no recorte atual (inclui quem não teve voto individual). */
  total: number;
  /** Quantos da bancada tinham voto individual a auditar. */
  comVoto: number;
}

/**
 * Agrega a lista **já filtrada** por partido — fonte única do gráfico
 * ("Como cada partido votou") e do cartão compartilhável por bancada.
 *
 * Ordenação: bancada maior primeiro; no desempate, quem mais votou contra a
 * proposta (o mesmo critério que a tela já usa).
 */
export function agregarPorPartido(
  parlamentares: ParlamentarConsolidado[],
  pautaSlug: string,
): LinhaPartido[] {
  const porPartido = new Map<string, Record<AlinhamentoVoto, number>>();

  for (const p of parlamentares) {
    const partido = p.partido?.trim() || 'SEM PARTIDO';
    const acc =
      porPartido.get(partido) ??
      ({ FAVORAVEL: 0, CONTRA: 0, ABSTENCAO: 0, AUSENTE: 0, NAO_APLICAVEL: 0 } as Record<
        AlinhamentoVoto,
        number
      >);
    acc[p.votos[pautaSlug] ?? 'AUSENTE'] += 1;
    porPartido.set(partido, acc);
  }

  return [...porPartido.entries()]
    .map(([partido, contagem]) => {
      const total = ORDEM_VOTOS.reduce((s, k) => s + contagem[k], 0);
      return { partido, contagem, total, comVoto: total - contagem.NAO_APLICAVEL };
    })
    .sort(
      (a, b) =>
        b.total - a.total ||
        b.contagem.CONTRA - a.contagem.CONTRA ||
        a.partido.localeCompare(b.partido, 'pt-BR'),
    );
}

export interface ResumoPartido {
  /** Posição com mais votos na bancada (`null` em empate). */
  destaque: AlinhamentoVoto | null;
  /** Votos na posição de destaque. */
  qtdDestaque: number;
  /** Rótulo FACTUAL do destaque (ex.: "Apoiou isenção") ou "Empate". */
  rotulo: string;
  /** "40 de 44" — sempre sobre quem tinha voto individual. */
  contagem: string;
  /** % do destaque sobre quem tinha voto individual. */
  percentual: number;
  empate: boolean;
}

/**
 * Resumo FACTUAL da bancada na pauta — a manchete do cartão.
 *
 * Regras (anti-desinformação):
 *   - a conta é sobre quem **tinha voto individual** (`comVoto`), nunca sobre a
 *     bancada inteira, para não transformar "sem votação nominal" em abstenção;
 *   - empate é empate (não escolhemos um lado);
 *   - `null` quando a bancada não teve votação nominal na matéria.
 */
export function resumoPartido(linha: LinhaPartido, pautaSlug: string): ResumoPartido | null {
  if (linha.comVoto === 0) return null;

  const candidatos: AlinhamentoVoto[] = ['FAVORAVEL', 'CONTRA', 'ABSTENCAO', 'AUSENTE'];
  const maior = Math.max(...candidatos.map((k) => linha.contagem[k]));
  const empatados = candidatos.filter((k) => linha.contagem[k] === maior);

  if (empatados.length > 1) {
    return {
      destaque: null,
      qtdDestaque: maior,
      rotulo: 'Empate',
      contagem: `${maior} de ${linha.comVoto}`,
      percentual: Math.round((maior / linha.comVoto) * 100),
      empate: true,
    };
  }

  const destaque = empatados[0];
  return {
    destaque,
    qtdDestaque: maior,
    rotulo: rotuloAlinhamento(destaque, pautaSlug),
    contagem: `${maior} de ${linha.comVoto}`,
    percentual: Math.round((maior / linha.comVoto) * 100),
    empate: false,
  };
}
