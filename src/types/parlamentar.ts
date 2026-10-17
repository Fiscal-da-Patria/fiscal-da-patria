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
   * - `pendente`  → sem registro de votação nominal até a geração dos dados.
   */
  status: 'nominal' | 'simbolica' | 'pendente';
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
  /** Alinhamento por slug da pauta (matriz densa: todas as pautas presentes). */
  votos: Record<string, AlinhamentoVoto>;
  /** Voto bruto registrado na fonte (auditoria: o que o parlamentar apertou). */
  votosOriginais?: Record<string, VotoCanonico>;
  /** Motivo curto por pauta quando não há voto individual (ex.: votação simbólica). */
  motivos?: Record<string, string>;
}
