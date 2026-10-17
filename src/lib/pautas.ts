import type { AlinhamentoVoto, PautaConfig, VotoCanonico } from '../types/parlamentar';

/**
 * As **10 pautas** oficiais do MVP (fonte: docs/01_prd_visao_geral.md / PRD):
 *   7 auditadas na Câmara + 3 auditadas no Senado Federal.
 *
 * As `votacaoId` (Câmara) foram curadas manualmente junto à API oficial
 * (`/proposicoes/{id}/votacoes`) para evitar confundir o texto-base com
 * destaques/substitutivos — risco crítico nas pautas invertidas.
 *
 * O bloco `senado` de cada pauta é **verificado na fonte oficial** do Senado
 * (dadosabertos/senador + /plenario/lista/votacao + /dadosabertos/votacao):
 *   - `nominal`   → existe votação nominal (voto individual por senador);
 *   - `simbolica` → o Senado apreciou a matéria SEM registro individual de voto;
 *   - `pendente`  → nenhum registro de votação nominal até 12/10/2026.
 * O script `scripts/fetch_senado.ts` revalida esses dados a cada execução e
 * grava a auditoria em `scripts/data/senado_votacoes_map.json`.
 */
export const PAUTAS: PautaConfig[] = [
  {
    slug: 'cesta_basica',
    rotuloPopular: 'Comida sem imposto (Cesta Básica)',
    ementaOficial: 'Altera o Sistema Tributário Nacional.',
    materia: 'PEC 45/2019',
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2196833,
    votacaoId: '2196833-373',
    senado: {
      codigoSessaoVotacao: 6773,
      dataSessao: '2023-11-08',
      descricao:
        'Votação nominal da Emenda nº 803 (Substitutivo) e das Emendas e Subemendas de Plenário, em primeiro turno, nos termos dos pareceres, ressalvados os destaques.',
      status: 'nominal',
      nota: 'Houve votação nominal no Senado em 08/11/2023 (1º turno).',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/158930',
    },
  },
  {
    slug: 'igualdade_salarial',
    rotuloPopular: 'Salário igual para trabalho igual',
    ementaOficial:
      'Dispõe sobre a igualdade salarial e remuneratória entre mulheres e homens para o exercício de mesma função e altera a CLT.',
    materia: 'PL 1085/2023',
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2351179,
    votacaoId: '2351179-51',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'simbolica',
      nota: 'O Senado aprovou a matéria em votação simbólica (sem voto individual). Virou a Lei 14.611/2023.',
    },
  },
  {
    slug: 'fim_blindagem',
    rotuloPopular: 'Fim da blindagem de políticos',
    ementaOficial:
      'Altera os arts. 14, 27, 53, 102 e 105 da Constituição Federal, para dispor sobre as prerrogativas parlamentares e dá outras providências.',
    materia: 'PEC 3/2021',
    // INVERTIDA: votar NÃO é defender o povo (fim da blindagem);
    // votar SIM é manter o privilégio.
    invertida: true,
    casa: 'CAMARA',
    idProposicao: 2270800,
    votacaoId: '2270800-160',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'pendente',
      nota: 'Nenhum registro de votação nominal no Senado até 12/10/2026.',
    },
  },
  {
    slug: 'ir_isento',
    rotuloPopular: 'Salário livre de IR (isenção do Imposto de Renda)',
    ementaOficial:
      'Altera a legislação do imposto sobre a renda para instituir a redução do imposto devido nas bases de cálculo mensal e anual e a tributação mínima para as pessoas físicas que auferem altas rendas, e dá outras providências.',
    materia: 'PL 1087/2025',
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2487436,
    votacaoId: '2487436-169',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'pendente',
      nota: 'Nenhum registro de votação nominal no Senado até 12/10/2026.',
    },
  },
  {
    slug: 'super_ricos',
    rotuloPopular: 'Cobrar imposto dos super-ricos',
    ementaOficial:
      'Dispõe sobre a tributação de aplicações em fundos de investimento no País e da renda auferida por pessoas físicas residentes no País em aplicações financeiras, entidades controladas e trusts no exterior.',
    materia: 'PL 4173/2023',
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2383287,
    votacaoId: '2383287-43',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'pendente',
      nota: 'Nenhum registro de votação nominal no Senado até 12/10/2026.',
    },
  },
  {
    slug: 'teto_juro_cartao',
    rotuloPopular: 'Teto para o juro do cartão',
    ementaOficial:
      'Institui o Programa Desenrola Brasil e estabelece a necessidade de imposição de limite aos juros cobrados na modalidade cartão de crédito rotativo.',
    materia: 'PL 2685/2022',
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2336393,
    // Aprovação do mérito foi simbólica; usamos o voto NOMINAL "Mantido o texto"
    // (SIM = manter o texto do projeto, que inclui o teto de 100% dos juros).
    votacaoId: '2336393-56',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'simbolica',
      nota: 'O Senado aprovou a matéria em votação simbólica (sem voto individual). Virou a Lei 14.690/2023.',
    },
  },
  {
    slug: 'piso_enfermagem',
    rotuloPopular: 'Piso salarial da enfermagem',
    ementaOficial:
      'Institui o piso salarial nacional do Enfermeiro, do Técnico de Enfermagem, do Auxiliar de Enfermagem e da Parteira.',
    materia: 'PL 2564/2020',
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2309349,
    votacaoId: '2309349-146',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'simbolica',
      nota: 'O Senado aprovou a matéria em votação simbólica (sem voto individual). Virou a Lei 14.434/2022.',
    },
  },
  {
    slug: 'fim_escala_6x1',
    rotuloPopular: 'Fim da escala 6x1 (jornada de 36 horas)',
    ementaOficial:
      'Altera o art. 7º, inciso XII, da Constituição Federal, reduzindo a jornada de trabalho a 36 horas semanais, em 10 anos.',
    materia: 'PEC 221/2019',
    // SIM = acabar com a escala 6x1 (reduzir a jornada) → a favor do cidadão.
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2233802,
    // 1º turno no plenário em 27/05/2026 (Sim 472 × Não 22 × Obstrução 1).
    votacaoId: '2233802-424',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'pendente',
      nota: 'Nenhum registro de votação nominal no Senado até 12/10/2026.',
    },
  },
  // ---------------------------------------------------------------------------
  // Pautas auditadas no SENADO (votação nominal real no plenário do Senado).
  // Para os deputados, o voto fica `NAO_APLICAVEL` com motivo explicando o escopo.
  // ---------------------------------------------------------------------------
  {
    slug: 'aposentadoria_agentes_saude',
    rotuloPopular: 'Aposentadoria dos agentes de saúde e de endemias',
    ementaOficial:
      'Altera os arts. 40, 198 e 201 da Constituição Federal, para estabelecer o direito à aposentadoria diferenciada aos agentes comunitários de saúde e aos agentes de combate às endemias, bem como para determinar a regularização do vínculo funcional desses agentes; e dá outras providências.',
    materia: 'PEC 14/2021',
    invertida: false,
    casa: 'SENADO',
    senado: {
      codigoSessaoVotacao: 7096,
      dataSessao: '2026-07-14',
      descricao:
        'Votação nominal da Proposta de Emenda à Constituição nº 14, de 2021, nos termos do parecer (1º turno).',
      status: 'nominal',
      nota: 'Votação nominal do Senado em 14/07/2026 (1º turno).',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/170850',
    },
  },
  {
    slug: 'crime_organizado',
    rotuloPopular: 'Lei mais dura contra o crime organizado',
    ementaOficial:
      'Institui o marco legal do combate ao crime organizado no Brasil; tipifica os crimes de domínio social estruturado e de favorecimento ao domínio social estruturado; e altera os Decretos-Leis nºs 2.848, de 7 de dezembro de 1940 (Código Penal), e 3.689, de 3 de outubro de 1941 (Código de Processo Penal), e as Leis nºs 8.072, de 25 de julho de 1990 (Lei dos Crimes Hediondos), 7.210, de 11 de julho de 1984 (Lei de Execução Penal), 11.343, de 23 de agosto de 2006, 10.826, de 22 de dezembro de 2003, 9.613, de 3 de março de 1998, e 4.737, de 15 de julho de 1965 (Código Eleitoral).',
    materia: 'PL 5582/2025',
    invertida: false,
    casa: 'SENADO',
    senado: {
      codigoSessaoVotacao: 7037,
      dataSessao: '2025-12-10',
      descricao:
        'Votação nominal da Emenda nº 117 (Substitutivo) ao Projeto de Lei nº 5.582, de 2025, nos termos do parecer.',
      status: 'nominal',
      nota: 'Votação nominal do Senado em 10/12/2025 (substitutivo).',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/171725',
    },
  },
  {
    slug: 'preco_energia',
    rotuloPopular: 'Aliviar o preço da energia (choque internacional)',
    ementaOficial:
      'Dispõe sobre regras para renúncias de receita com o objetivo de mitigar os impactos econômicos causados pelo choque no mercado internacional de energia decorrente do conflito no Oriente Médio e excepcionaliza os benefícios tributários destinados à Política Nacional de Minerais Críticos e Estratégicos, ao Programa de Desenvolvimento da Indústria de Fertilizantes e à realização da Copa do Mundo Feminina, e dá outras providências.',
    materia: 'PLP 114/2026',
    invertida: false,
    casa: 'SENADO',
    senado: {
      codigoSessaoVotacao: 7102,
      dataSessao: '2026-08-12',
      descricao:
        'Votação nominal do Projeto de Lei Complementar nº 114, de 2026, nos termos do parecer, ressalvado o destaque.',
      status: 'nominal',
      nota: 'Votação nominal do Senado em 12/08/2026.',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/175446',
    },
  },
];

/** Remove acentos e padroniza para maiúsculas. */
function semAcento(texto: string): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

/** Normaliza o `tipoVoto` bruto da API da Câmara para o voto canônico. */
export function normalizarVoto(tipoVoto: string): VotoCanonico {
  const v = semAcento(tipoVoto);
  if (v.startsWith('SIM')) return 'SIM';
  if (v.startsWith('NAO')) return 'NAO';
  if (v.startsWith('ABSTEN')) return 'ABSTENCAO';
  if (v.startsWith('OBSTRU')) return 'OBSTRUCAO';
  return 'AUSENTE';
}

/**
 * Normaliza o voto do Senado Federal para o voto canônico.
 *
 * Vocabulário oficial observado em `dadosabertos.senado.leg.br`:
 *   "Sim" | "Não" | "Abstenção" | "AP" (atividade parlamentar) |
 *   "LS" (licença-saúde) | "P-NRV" (presidente que não registra voto) |
 *   "NCom" (não compareceu) | "Presidente (art. 51 RISF)".
 *
 * Tudo que **não** é voto registrado cai em `AUSENTE` — nunca é inventado um
 * alinhamento. O valor bruto é preservado em `votosOriginais` (auditoria).
 */
export function normalizarVotoSenado(voto: string): VotoCanonico {
  const v = semAcento(voto);
  if (v.startsWith('SIM')) return 'SIM';
  if (v.startsWith('NAO')) return 'NAO';
  if (v.startsWith('ABSTEN')) return 'ABSTENCAO';
  return 'AUSENTE';
}

/**
 * Regra ÚNICA de inversão semântica.
 * - invertida = false: SIM → FAVORAVEL, NÃO → CONTRA.
 * - invertida = true : SIM → CONTRA, NÃO → FAVORAVEL (ex.: PEC da Blindagem).
 */
export function aplicarInversao(voto: VotoCanonico, invertida: boolean): AlinhamentoVoto {
  if (voto === 'SIM') return invertida ? 'CONTRA' : 'FAVORAVEL';
  if (voto === 'NAO') return invertida ? 'FAVORAVEL' : 'CONTRA';
  if (voto === 'ABSTENCAO') return 'ABSTENCAO';
  return 'AUSENTE';
}

/** Link oficial da proposição no domínio camara.leg.br. */
export function urlProposicaoOficial(idProposicao: number): string {
  return `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${idProposicao}`;
}

/**
 * Link oficial da fonte da pauta **na casa onde o voto foi auditado**:
 * Câmara → camara.leg.br; Senado → senado.leg.br.
 */
export function urlFonteOficial(pauta: PautaConfig): string {
  if (pauta.casa === 'SENADO') return pauta.senado?.urlMateria ?? '#';
  if (pauta.idProposicao) return urlProposicaoOficial(pauta.idProposicao);
  return pauta.senado?.urlMateria ?? '#';
}

/**
 * Rótulos **FACTUAIS** por pauta (conformidade editorial).
 *
 * Regra: descrever a **ação votada** em 2–3 palavras, sem juízo de valor
 * (nada de "a favor/contra o cidadão") — o eleitor tira a própria conclusão.
 *
 * - `apoio`      → alinhamento `FAVORAVEL` (verde)
 * - `divergente` → alinhamento `CONTRA` (vermelho)
 *
 * Atenção à **inversão semântica** da PEC 3/2021: ali o verde é quem
 * **rejeitou a blindagem** (votou NÃO), como manda o PRD.
 */
export const ROTULOS_FACTUAIS: Record<string, { apoio: string; divergente: string }> = {
  cesta_basica: { apoio: 'Apoiou isenção', divergente: 'Rejeitou isenção' },
  igualdade_salarial: { apoio: 'Apoiou a lei', divergente: 'Rejeitou a lei' },
  fim_blindagem: { apoio: 'Rejeitou blindagem', divergente: 'Apoiou blindagem' },
  ir_isento: { apoio: 'Apoiou isenção', divergente: 'Rejeitou isenção' },
  super_ricos: { apoio: 'Apoiou tributar', divergente: 'Rejeitou tributar' },
  teto_juro_cartao: { apoio: 'Apoiou teto', divergente: 'Rejeitou teto' },
  piso_enfermagem: { apoio: 'Apoiou piso', divergente: 'Rejeitou piso' },
  fim_escala_6x1: { apoio: 'Apoiou fim do 6x1', divergente: 'Rejeitou fim do 6x1' },
  aposentadoria_agentes_saude: {
    apoio: 'Apoiou aposentadoria',
    divergente: 'Rejeitou aposentadoria',
  },
  crime_organizado: { apoio: 'Apoiou rigor', divergente: 'Rejeitou rigor' },
  preco_energia: { apoio: 'Apoiou desconto', divergente: 'Rejeitou desconto' },
};

/**
 * Rótulo factual do voto de um parlamentar em uma pauta.
 * Devolve `null` quando o alinhamento não é de mérito (abstenção/ausente/sem voto
 * individual) — aí o chamador usa o rótulo genérico.
 */
export function rotuloFactual(slug: string, alinhamento: string): string | null {
  const rotulos = ROTULOS_FACTUAIS[slug];
  if (!rotulos) return null;
  if (alinhamento === 'FAVORAVEL') return rotulos.apoio;
  if (alinhamento === 'CONTRA') return rotulos.divergente;
  return null;
}

/**
 * **O que isso muda no dia a dia** — uma frase curta e concreta por pauta.
 *
 * Regra anti-desinformação: cada frase é uma tradução **direta do texto oficial**
 * (`ementaOficial`, transcrito da fonte) para o cotidiano. Nada de número, prazo
 * ou efeito que não esteja na própria matéria.
 */
export const EXEMPLOS_PRATICOS: Record<string, string> = {
  cesta_basica:
    'a cesta básica pode ficar com imposto zero: o arroz, o feijão e a comida do prato de todo dia.',
  igualdade_salarial:
    'mulher e homem na mesma função passam a ter que receber o mesmo salário.',
  fim_blindagem:
    'mexe nas prerrogativas de deputados e senadores — foro especial e imunidade parlamentar.',
  ir_isento:
    'menos Imposto de Renda para quem ganha menos, com cobrança mínima de quem ganha muito.',
  super_ricos:
    'cobra imposto dos fundos de investimento e do dinheiro aplicado no exterior pelos mais ricos.',
  teto_juro_cartao:
    'cria o Desenrola Brasil e limita os juros do rotativo do cartão de crédito.',
  piso_enfermagem:
    'fixa um piso salarial nacional para enfermeiros, técnicos, auxiliares e parteiras.',
  fim_escala_6x1:
    'reduz a jornada para 36 horas por semana em 10 anos — o fim do 6x1.',
  aposentadoria_agentes_saude:
    'aposentadoria com regra especial para agentes de saúde e de combate às endemias.',
  crime_organizado:
    'regras mais duras contra facções, alcançando também quem favorece ou financia o crime organizado.',
  preco_energia:
    'abre espaço no orçamento para aliviar a conta de luz no choque internacional de energia.',
};

/** Exemplo prático da pauta (fallback: a própria ementa oficial). */
export function exemploPratico(pauta: PautaConfig): string {
  return EXEMPLOS_PRATICOS[pauta.slug] ?? pauta.ementaOficial;
}

/**
 * **Por que** a casa filtrada não tem voto registrado nesta pauta.
 *
 * Fonte: o bloco `senado` de cada pauta (curado e revalidado contra a API
 * oficial em `scripts/fetch_senado.ts`): `nominal` (houve painel eletrônico),
 * `simbolica` (o Senado apreciou sem registro individual) e `pendente`
 * (nenhum registro até a data da última verificação).
 *
 * Usado quando a casa filtrada tem **zero** votos aplicáveis: em vez de listar
 * centenas de "Sem voto individual", o app explica o motivo real do vazio.
 */
export function motivoSemVotoCasa(pauta: PautaConfig, casa: "CAMARA" | "SENADO"): string {
  if (pauta.casa === "SENADO") {
    return `A votação de ${pauta.materia} é auditada no Senado Federal — a Câmara dos Deputados não tem votação nominal registrada nesta matéria.`;
  }
  if (casa === "SENADO") {
    if (pauta.senado?.status === "pendente") {
      return "O Senado ainda não votou esta matéria: não há registro de votação nominal na fonte oficial (a proposta está na Câmara ou aguardando pauta no Senado).";
    }
    if (pauta.senado?.status === "simbolica") {
      return "O Senado aprovou esta matéria em votação SIMBÓLICA: sem painel eletrônico não existe voto individual de senador para auditar.";
    }
    return "O Senado votou esta matéria, mas o voto individual não está disponível na fonte oficial.";
  }
  return "Não há votação nominal da Câmara dos Deputados registrada para esta matéria.";
}
