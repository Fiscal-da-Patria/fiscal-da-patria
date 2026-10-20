/**
 * Contratos de dados compartilhados — Fiscal da Pátria.
 * Fonte: docs/01_prd_visao_geral.md e docs/03_roadmap_e_codigo_base.md.
 *
 * Estes tipos ficam em `src/types` (e não em `scripts/`) para que os
 * componentes de UI possam importá-los sem puxar código Node (fs/path)
 * para o bundle do cliente.
 */

/** Voto canônico bruto, após normalização (sem acento/caixa). */
export type VotoCanonico = 'SIM' | 'NAO' | 'ABSTENCAO' | 'OBSTRUCAO' | 'AUSENTE';

/** Cargo do parlamentar auditado. */
export type CargoParlamentar = 'DEPUTADO' | 'SENADOR';

/** Casa onde o voto nominal foi registrado (origem da fonte oficial). */
export type CasaVotacao = 'CAMARA' | 'SENADO';

/**
 * Alinhamento do voto com o interesse popular (após a inversão semântica).
 *
 * - `NAO_APLICAVEL`: **não existe voto individual a auditar**. Exemplo: o
 *   Senado Federal apreciou a matéria por votação **simbólica** (sem registro
 *   nominal) — marcar `AUSENTE` nesse caso seria desinformação.
 */
export type AlinhamentoVoto = 'FAVORAVEL' | 'CONTRA' | 'ABSTENCAO' | 'AUSENTE' | 'NAO_APLICAVEL';

/** Situação da matéria correlata no Senado Federal (verificada na fonte oficial). */
export interface VotacaoSenado {
  /** Código oficial da votação nominal no Senado (0 = não houve votação nominal). */
  codigoSessaoVotacao: number;
  /** Data da sessão (AAAA-MM-DD) ou '' quando não houve votação nominal. */
  dataSessao: string;
  /** Descrição oficial da votação (quando houver). */
  descricao: string;
  /**
   * - `nominal`   → houve votação nominal (existe voto individual por senador);
   * - `simbolica` → o Senado apreciou a matéria SEM registro individual de voto;
   * - `pendente`  → sem registro de votação nominal até a geração dos dados;
   * - `arquivada` → a matéria foi arquivada no Senado (ex.: rejeição na CCJ).
   */
  status: 'nominal' | 'simbolica' | 'pendente' | 'arquivada';
  /** Explicação curta, factual e auditável, exibida na ficha do parlamentar. */
  nota: string;
  /** Link oficial da matéria no domínio senado.leg.br (quando a matéria tem página pública lá). */
  urlMateria?: string;
}

/** Configuração de uma pauta popular do MVP. */
export interface PautaConfig {
  slug: string;
  /** Rótulo em linguagem popular (linguagem do povo). */
  rotuloPopular: string;
  /** Ementa oficial (fonte pública). */
  ementaOficial: string;
  /** Identificação da matéria (ex.: "PEC 3/2021"). */
  materia: string;
  /** true = SIM é contrário ao interesse popular (ex.: PEC da Blindagem). */
  invertida: boolean;
  /** Casa onde o voto nominal desta pauta é auditado. */
  casa: CasaVotacao;
  /** Câmara: id da proposição na API oficial. */
  idProposicao?: number;
  /** Câmara: id da votação-chave curada (formato {idProposicao}-{sequencial}). */
  votacaoId?: string;
  /** Senado: situação da matéria correlata (nominal / simbólica / pendente). */
  senado?: VotacaoSenado;
  /**
   * Situação da matéria após a tramitação. Só é preenchida quando há uma
   * verificação oficial (ex.: PEC 221/2019 → EC 141/2026).
   */
  status?: 'PROMULGADA' | 'SANCIONADA' | 'ARQUIVADA' | 'REVOGADA';
  /** Norma jurídica resultante (ex.: "Emenda Constitucional 141/2026"). */
  normaOficial?: string;
  /** Data de promulgação da PEC (AAAA-MM-DD). */
  dataPromulgacao?: string;
  /** Data de sanção da lei (AAAA-MM-DD). */
  dataSancao?: string;
  /** Data de arquivamento da proposta (AAAA-MM-DD). */
  dataArquivamento?: string;
  /** Data em que a norma foi revogada por outra norma (AAAA-MM-DD). */
  dataRevogacao?: string;
  /** Norma que revogou a lei (ex.: "Medida Provisória 1.394/2026"). */
  normaRevogadora?: string;
  /** Link oficial da norma revogadora (planalto.gov.br). */
  urlNormaRevogadora?: string;
  /** Link oficial da tramitação da norma revogadora no Congresso. */
  urlMateriaRevogadora?: string;
  /** Situação atual da matéria, em linguagem factual (ex.: "MP em vigor; Congresso vai votar"). */
  situacaoAtual?: string;
  /** Link oficial da norma (planalto.gov.br). */
  urlNorma?: string;
  /** Placar final na Câmara, como consta na fonte oficial. */
  resultadoCamara?: string;
  /** Placar final no Senado, como consta na fonte oficial. */
  resultadoSenado?: string;
  /** O que a norma aprovada faz, em linguagem popular e fiel ao texto. */
  resumoFactual?: string;
  /** Ponto que o resumo não pode omitir (regimes diferenciados, exceções legais). */
  ressalva?: string;
  /** Explicação objetiva do que foi aprovado (título + texto curto). */
  pontosExplicativos?: { titulo: string; texto: string }[];
}

/** Registro consolidado de um parlamentar (item de public/data/parlamentares.json). */
export interface ParlamentarConsolidado {
  /** ID namespaced e estável: `camara-74646` (deputado) | `senado-5894` (senador). */
  id: string;
  cargo: CargoParlamentar;
  nome: string;
  nomeCivil?: string;
  partido: string;
  uf: string;
  /** Caminho local da foto oficial (same-origin: exigido pelo card exportável). */
  fotoUrl: string;
  email?: string;
  /** Perfil oficial na casa de origem (camara.leg.br / senado.leg.br). */
  urlPerfilOficial: string;
  /** Votos nominais recebidos na urna (TSE). 0 quando desconhecido. */
  votosEleicao: number;
  /** Ano do pleito de onde veio `votosEleicao` (ex.: 2022). */
  anoEleicao?: number;
  /** Alinhamento por slug da pauta (matriz densa: todas as pautas presentes). */
  votos: Record<string, AlinhamentoVoto>;
  /**
   * Voto efetivo registrado na fonte (SIM/NÃO/ABSTENÇÃO/OBSTRUÇÃO).
   * `AUSENTE` só quando o parlamentar estava em exercício e não registrou voto;
   * status que não são voto (Presidente/AP/P-NRV/LS) **não** entram aqui.
   */
  votosOriginais?: Record<string, VotoCanonico>;
  /** Motivo oficial quando não há voto individual a auditar. */
  motivos?: Record<string, string>;
}
