import type { AlinhamentoVoto, PautaConfig, VotoCanonico } from '../types/parlamentar';

/**
 * As **12 pautas** oficiais do MVP (fonte: docs/01_prd_visao_geral.md / PRD):
 *   9 auditadas na Câmara + 3 auditadas no Senado Federal.
 *   A escala 6x1 (PEC 221/2019) tem painel nominal nas **duas** Casas e virou a
 *   Emenda Constitucional 141/2026 (promulgada em 16/10/2026).
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
      nota: 'Votação nominal do Senado em 08/11/2023 (1º e 2º turnos): 53 SIM × 24 NÃO. Virou a Emenda Constitucional 132/2023.',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/158930',
    },
    status: 'PROMULGADA',
    normaOficial: 'Emenda Constitucional 132/2023',
    dataPromulgacao: '2023-12-20',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm',
    resultadoCamara: '375 SIM / 113 NÃO / 3 ABST — 2º turno em 06/07/2023',
    resultadoSenado: '53 SIM / 24 NÃO — 1º e 2º turnos em 08/11/2023',
    resumoFactual:
      'A reforma tributária criou a Cesta Básica Nacional de Alimentos e autorizou alíquota zero de IBS e CBS para os produtos definidos em lei complementar. A Lei Complementar 214/2025 zerou o imposto dos itens do Anexo I e criou o cashback para famílias de baixa renda.',
    pontosExplicativos: [
      {
        titulo: 'A cesta básica virou política constitucional',
        texto:
          'A EC 132/2023 criou a Cesta Básica Nacional de Alimentos (art. 8º), com respeito à diversidade regional e à alimentação saudável. A lei complementar define quais produtos entram e sobre eles as alíquotas do IBS e da CBS são reduzidas a zero.',
      },
      {
        titulo: 'O imposto foi zerado na lei complementar',
        texto:
          'A Lei Complementar 214/2025 (art. 125 e Anexo I) reduziu a zero as alíquotas de IBS e CBS nas vendas dos alimentos que compõem a cesta básica. É essa lista que vale para o consumidor — não a ementa da PEC.',
      },
      {
        titulo: 'Cashback para quem ganha menos',
        texto:
          'A mesma lei criou a devolução personalizada de IBS e CBS (cashback) para famílias de baixa renda inscritas no CadÚnico, com renda mensal por pessoa de até meio salário mínimo.',
      },
    ],
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
    status: 'SANCIONADA',
    normaOficial: 'Lei 14.611/2023',
    dataSancao: '2023-07-03',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14611.htm',
    resultadoCamara: '325 SIM / 36 NÃO / 3 ABST — 04/05/2023',
    resultadoSenado: 'Aprovada por votação simbólica (sem painel nominal)',
    resumoFactual:
      'Tornou obrigatória a igualdade salarial e de critérios remuneratórios entre mulheres e homens para trabalho de igual valor ou mesma função, com multa para o empregador, relatórios de transparência e canais de denúncia.',
    pontosExplicativos: [
      {
        titulo: 'Mesmo trabalho, mesmo salário',
        texto:
          'A lei torna obrigatória a igualdade salarial e de critérios remuneratórios entre mulheres e homens para trabalho de igual valor ou no exercício da mesma função (art. 2º).',
      },
      {
        titulo: 'Multa de 10 vezes o salário devido',
        texto:
          'Na discriminação por sexo, raça, etnia, origem ou idade, o empregador paga as diferenças salariais e uma multa de 10 vezes o novo salário devido — dobrada na reincidência — sem prejuízo da indenização por dano moral (art. 3º).',
      },
      {
        titulo: 'Transparência nas empresas com 100+ empregados',
        texto:
          'Empresas com 100 ou mais empregados publicam relatórios semestrais de transparência salarial, com dados anonimizados que permitem comparar salários e a presença de mulheres em cargos de direção e chefia (art. 5º).',
      },
    ],
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
    // Voto final da Câmara: emenda aglutinativa de Plenário nº 1, em 17/09/2025
    // (Sim 314 × Não 168). O texto anterior (2º turno, 344×133) foi substituído.
    votacaoId: '2270800-175',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'arquivada',
      nota: 'A Câmara aprovou em 17/09/2025 e enviou ao Senado (PEC 3-C/2021). A CCJ do Senado rejeitou a proposta por inconstitucionalidade em 24/09/2025 e a matéria foi arquivada — não houve votação nominal no plenário.',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/170519',
    },
    status: 'ARQUIVADA',
    dataArquivamento: '2025-09-24',
    resultadoCamara: '314 SIM / 168 NÃO — texto final em 17/09/2025',
    resultadoSenado: 'Arquivada pela CCJ em 24/09/2025 (inconstitucionalidade)',
    resumoFactual:
      'A Câmara aprovou o texto final em 17/09/2025 (314 SIM × 168 NÃO). No Senado, a Comissão de Constituição e Justiça rejeitou a proposta por inconstitucionalidade em 24/09/2025 e a matéria foi arquivada. Não houve votação nominal no plenário do Senado.',
    pontosExplicativos: [
      {
        titulo: 'O que a PEC mudava',
        texto:
          'A PEC 3/2021 alterava os arts. 14, 27, 53, 102 e 105 da Constituição para mexer nas prerrogativas de deputados e senadores — entre elas o foro especial e a imunidade parlamentar.',
      },
      {
        titulo: 'A Câmara aprovou; o Senado barrou na CCJ',
        texto:
          'O texto final foi aprovado na Câmara em 17/09/2025 e seguiu ao Senado como PEC 3-C/2021. Em 24/09/2025, a CCJ do Senado rejeitou a proposta por inconstitucionalidade (art. 101, § 1º, do Regimento do Senado).',
      },
      {
        titulo: 'O que acontece agora',
        texto:
          'A proposta foi arquivada e não virou emenda constitucional. O tema só volta se alguém apresentar uma nova PEC — por isso não há “voto no Senado” para auditar nesta matéria.',
      },
    ],
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
      status: 'simbolica',
      nota: 'O Senado aprovou a matéria em votação simbólica (sem voto individual). Virou a Lei 15.270/2025.',
    },
    status: 'SANCIONADA',
    normaOficial: 'Lei 15.270/2025',
    dataSancao: '2025-11-26',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm',
    resultadoCamara: '493 SIM / 0 NÃO — 01/10/2025',
    resultadoSenado: 'Aprovada por votação simbólica (sem painel nominal)',
    resumoFactual:
      'A partir de 2026, quem recebe até R$ 5.000 por mês fica com Imposto de Renda zero; entre R$ 5.000,01 e R$ 7.350 o desconto cai gradualmente. Para financiar, a lei criou retenção de 10% em lucros e dividendos acima de R$ 50 mil por mês e tributação mínima para rendas acima de R$ 600 mil por ano.',
    pontosExplicativos: [
      {
        titulo: 'IR zero até R$ 5.000 por mês',
        texto:
          'A partir de janeiro de 2026, a redução do imposto mensal zera o IR para rendimentos tributáveis de até R$ 5.000. Entre R$ 5.000,01 e R$ 7.350, a redução cai linearmente até desaparecer (art. 3º-A da Lei 9.250/1995).',
      },
      {
        titulo: 'Quem ganha mais paga um mínimo',
        texto:
          'A partir de 2027 (ano-calendário 2026), quem soma mais de R$ 600 mil de rendimentos no ano fica sujeito à tributação mínima do IR. Lucros e dividendos acima de R$ 50 mil por mês pagos por uma mesma empresa também passam a ter retenção de 10%.',
      },
      {
        titulo: 'A conta do benefício',
        texto:
          'A lei não criou um imposto novo: combinou a redução para quem ganha menos com a cobrança de quem hoje paga pouco sobre lucros e dividendos. Por isso o texto passou com 493 votos a 0 na Câmara.',
      },
    ],
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
      status: 'simbolica',
      nota: 'O Senado aprovou a matéria em votação simbólica (sem voto individual). Virou a Lei 14.754/2023.',
    },
    status: 'SANCIONADA',
    normaOficial: 'Lei 14.754/2023',
    dataSancao: '2023-12-12',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14754.htm',
    resultadoCamara: '323 SIM / 119 NÃO / 1 ABST — 25/10/2023',
    resultadoSenado: 'Aprovada por votação simbólica (sem painel nominal)',
    resumoFactual:
      'A lei passou a cobrar 15% de Imposto de Renda sobre a renda anual de aplicações financeiras, lucros de empresas controladas e trusts no exterior. Também mudou a tributação dos fundos de investimento no País.',
    pontosExplicativos: [
      {
        titulo: '15% sobre o dinheiro no exterior',
        texto:
          'Os rendimentos de aplicações financeiras no exterior e os lucros de entidades controladas passam a ser declarados separadamente e tributados em 15% no ajuste anual, sem deduções (art. 2º, § 1º).',
      },
      {
        titulo: 'Trusts e empresas controladas entram na conta',
        texto:
          'A lei alcança as entidades controladas e os trusts no exterior. Lucros apurados até 31/12/2023 são tributados quando efetivamente disponibilizados à pessoa física; os apurados a partir de 2024 seguem as novas regras (art. 6º).',
      },
      {
        titulo: 'Fundos de investimento também',
        texto:
          'A lei alterou a tributação dos fundos de investimento no País (Lei 11.033/2004), fechando brechas que permitiam postergar o imposto. O texto foi sancionado com veto parcial, mantido pelo Congresso em 21/05/2024.',
      },
    ],
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
    status: 'SANCIONADA',
    normaOficial: 'Lei 14.690/2023',
    dataSancao: '2023-10-03',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14690.htm',
    resultadoCamara: '349 SIM / 24 NÃO / 2 ABST — 05/09/2023',
    resultadoSenado: 'Aprovada por votação simbólica (sem painel nominal)',
    resumoFactual:
      'A lei criou o Desenrola Brasil para renegociar dívidas de pessoas físicas negativadas e obrigou os emissores de cartão a propor ao Banco Central limites para os juros do rotativo. Se o limite não for aprovado em 90 dias, o total de juros e encargos não pode passar do valor original da dívida.',
    pontosExplicativos: [
      {
        titulo: 'Desenrola Brasil',
        texto:
          'O programa renegocia dívidas privadas de pessoas físicas inscritas em cadastros de inadimplentes, para reduzir o endividamento e facilitar a volta ao crédito (art. 1º). A vigência foi prorrogada até 31/03/2024.',
      },
      {
        titulo: 'Teto de 100% no rotativo',
        texto:
          'Os emissores de cartão devem submeter ao Conselho Monetário Nacional, anualmente, limites de juros e encargos do rotativo e do parcelamento da fatura. Se o limite não sair em 90 dias, o total cobrado não pode exceder o valor original da dívida (art. 28, § 1º).',
      },
      {
        titulo: 'Vale para quem não aderir',
        texto:
          'O teto de 100% também se aplica aos emissores que ficarem fora da autorregulação (art. 28, § 2º). A lei ainda trata de prevenção ao superendividamento e de facilitação do acesso ao crédito.',
      },
    ],
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
    status: 'SANCIONADA',
    normaOficial: 'Lei 14.434/2022',
    dataSancao: '2022-08-04',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14434.htm',
    resultadoCamara: '449 SIM / 12 NÃO — 04/05/2022',
    resultadoSenado: 'Aprovada por votação simbólica (sem painel nominal)',
    resumoFactual:
      'Fixou o piso salarial nacional da enfermagem em R$ 4.750 para enfermeiros, 70% para técnicos e 50% para auxiliares e parteiras, tanto na CLT quanto no serviço público. Acordos não podem reduzir o piso.',
    pontosExplicativos: [
      {
        titulo: 'O piso e as proporções',
        texto:
          'O piso do enfermeiro é R$ 4.750 por mês. Técnico de enfermagem recebe 70% desse valor (R$ 3.325) e auxiliar de enfermagem e parteira recebem 50% (R$ 2.375).',
      },
      {
        titulo: 'Vale para CLT e servidores',
        texto:
          'A lei fixou o piso para os contratados pela CLT e também para servidores federais, estaduais, do Distrito Federal e municipais, incluindo autarquias e fundações (arts. 15-A a 15-C da Lei 7.498/1986).',
      },
      {
        titulo: 'Acordo não pode reduzir',
        texto:
          'Acordos individuais e convenções coletivas devem respeitar o piso; considerá-lo ilegal ou suprimi-lo é vedado. O dispositivo que previa exceções foi vetado, e o veto foi mantido pelo Congresso em 02/05/2023.',
      },
    ],
  },
  {
    slug: 'fim_escala_6x1',
    rotuloPopular: 'Fim da Escala 6x1 / Jornada 5x2',
    ementaOficial:
      'Altera o art. 7º da Constituição Federal para reduzir a duração máxima semanal do trabalho e prever 2 (dois) dias de repouso semanal remunerado, sem qualquer redução salarial.',
    materia: 'PEC 221/2019',
    // SIM = acabar com a escala 6x1 (reduzir a jornada) → a favor do cidadão.
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2233802,
    // 2º turno no plenário em 27/05/2026 (Sim 461 × Não 19 — Aprovada).
    votacaoId: '2233802-438',
    senado: {
      codigoSessaoVotacao: 7107,
      dataSessao: '2026-10-14',
      descricao:
        'Votação nominal da Proposta de Emenda à Constituição nº 221, de 2019, em segundo turno.',
      status: 'nominal',
      nota: 'Votação nominal do Senado em 14/10/2026 (2º turno): 75 SIM × 1 NÃO. A matéria virou a Emenda Constitucional 141/2026.',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/174386',
    },
    // Verificado no Planalto e nas APIs oficiais em 17/10/2026.
    status: 'PROMULGADA',
    normaOficial: 'Emenda Constitucional 141/2026',
    dataPromulgacao: '2026-10-16',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc141.htm',
    resultadoCamara: '461 SIM / 19 NÃO — 2º turno em 27/05/2026',
    resultadoSenado: '75 SIM / 1 NÃO — 2º turno em 14/10/2026',
    resumoFactual:
      'A Constituição passa a limitar a jornada a 8 horas diárias e 40 horas semanais, com 2 dias de repouso semanal remunerado (um deles preferencialmente aos domingos) e sem redução salarial. A transição começa em 16/12/2026 (teto de 42h) e termina em 16/12/2027 (40h).',
    ressalva:
      'O texto preserva regimes diferenciados: acordo ou convenção coletiva pode prever 2 dias de repouso na média do mês-calendário (art. 7º, § 2º) e lei pode tratar de jornadas especiais (§ 3º). Quem tem nível superior e recebe a partir de 2,5 vezes o teto do RGPS fica fora das regras de duração e controle de jornada (art. 8º).',
    pontosExplicativos: [
      {
        titulo: 'Jornada de 40 horas (e não 36h)',
        texto:
          'A PEC 221/2019 nasceu pedindo 36h em 10 anos. O texto aprovado mudou a Constituição para 8h por dia e 40h por semana, com 2 dias de descanso (regime 5x2, preferencialmente com domingo). A mobilização de 2025 (PEC 8/2025, semana de 4 dias, com a Dep. Erika Hilton entre os proponentes) foi apensada. Relatores: Dep. Leo Prates (Câmara) e Sen. Omar Aziz (Senado).',
      },
      {
        titulo: 'Cronograma oficial de transição (art. 6º)',
        texto:
          '16/12/2026 (2 meses após a publicação): o teto cai de 44h para 42h semanais. 16/12/2027: o teto definitivo passa a ser 40h. Desde 16/12/2026 também deixam de valer cláusulas de acordos coletivos incompatíveis com o novo descanso (art. 3º).',
      },
      {
        titulo: 'Garantia salarial (art. 2º)',
        texto:
          'Proibição expressa de redução salarial nominal, proporcional ou de qualquer outra espécie — inclusive nos pisos salariais. A jornada cai, o salário não.',
      },
      {
        titulo: 'Por que tramitou como PEC 221/2019?',
        texto:
          'Pela regra de apensamento, a proposta de 2025 foi anexada à PEC 221/2019, de Reginaldo Lopes (PT/MG), a mais antiga em tramitação. A norma saiu com o número da PEC de 2019 e virou a EC 141/2026.',
      },
    ],
  },
  {
    slug: 'bets',
    rotuloPopular: 'Bets: da regulamentação à proibição',
    ementaOficial:
      'Dispõe sobre a modalidade lotérica denominada apostas de quota fixa; altera as Leis nºs 5.768, de 20 de dezembro de 1971, e 13.756, de 12 de dezembro de 2018, e a Medida Provisória nº 2.158-35, de 24 de agosto de 2001; revoga dispositivos do Decreto-Lei nº 204, de 27 de fevereiro de 1967; e dá outras providências.',
    materia: 'PL 3626/2023',
    // Voto de 2023 sobre a REGULAMENTAÇÃO (não sobre a proibição de 2026).
    // SIM = apoiou a regulamentação; NÃO = rejeitou a regulamentação.
    invertida: false,
    casa: 'CAMARA',
    idProposicao: 2374400,
    // Votação final das emendas do Senado na Câmara: 292 SIM × 114 NÃO × 1 ABST.
    votacaoId: '2374400-110',
    senado: {
      codigoSessaoVotacao: 0,
      dataSessao: '',
      descricao: '',
      status: 'simbolica',
      nota: 'O Senado aprovou a matéria em votação simbólica (sem voto individual). Virou a Lei 14.790/2023.',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/160197',
    },
    status: 'REVOGADA',
    normaOficial: 'Lei 14.790/2023',
    dataSancao: '2023-12-29',
    dataRevogacao: '2026-09-25',
    normaRevogadora: 'Medida Provisória 1.394/2026',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14790.htm',
    urlNormaRevogadora:
      'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm',
    urlMateriaRevogadora:
      'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2647155',
    situacaoAtual:
      'Proibição em vigor por MP 1.394/2026; o Congresso ainda vai votar a medida (calendário atual até 23/11/2026, prorrogável).',
    resultadoCamara: '292 SIM / 114 NÃO / 1 ABST — emendas do Senado em 21/12/2023',
    resultadoSenado: 'Aprovada por votação simbólica (sem painel nominal)',
    resumoFactual:
      'A Lei 14.790/2023 regulamentou as apostas de quota fixa, inclusive eventos virtuais de jogos on-line, com autorizações, tributação e regras de publicidade. Em 25/09/2026, a MP 1.394/2026 proibiu a exploração, a oferta, a intermediação e a publicidade das bets no país; a lei foi revogada em grande parte e a MP aguarda votação no Congresso.',
    ressalva:
      'O placar de 292 SIM × 114 NÃO é o da votação final das emendas do Senado na Câmara, em 21/12/2023 — não de um destaque específico sobre jogos virtuais. A MP 1.394/2026 está em vigor, mas depende de votação no Congresso; o app não projeta votos futuros.',
    pontosExplicativos: [
      {
        titulo: '2023: o Congresso regulamentou as bets',
        texto:
          'O PL 3626/2023 regulamentou a modalidade de apostas de quota fixa, inclusive sobre eventos virtuais de jogos on-line. A Câmara aprovou as emendas do Senado em 21/12/2023 (292 SIM × 114 NÃO × 1 ABST); a redação final não teve painel nominal. A lei foi sancionada em 29/12/2023 como Lei 14.790/2023.',
      },
      {
        titulo: '2026: o Executivo proibiu as bets',
        texto:
          'A MP 1.394/2026, de 25/09/2026, proibiu a exploração, a oferta, a intermediação e a publicidade das apostas de quota fixa. O governo alega endividamento e problemas de saúde mental nas famílias. A MP deu 10 dias para sites e aplicativos saírem do ar (prazo de retirada voluntária em 05/10/2026, 23h59) e 30 dias para extinguir as autorizações; os bancos devolveram saldos entre 9 e 14/10/2026, e depois a Caixa assumiu os valores não sacados.',
      },
      {
        titulo: 'O Congresso ainda vai votar a MP',
        texto:
          'A MP está em vigor, mas precisa ser aprovada pela Câmara e pelo Senado. Até 18/10/2026 não havia votação nominal registrada; o calendário da Câmara vai até 23/11/2026 (prorrogável por mais 60 dias). O placar de 2023 mostra quem apoiou ou rejeitou a regulamentação; ele não antecipa como cada parlamentar votará a MP.',
      },
    ],
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
    status: 'PROMULGADA',
    normaOficial: 'Emenda Constitucional 140/2026',
    dataPromulgacao: '2026-10-16',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc140.htm',
    resultadoCamara: 'Aprovada em 2 turnos — enviada ao Senado em 07/10/2025',
    resultadoSenado: '73 SIM / 1 NÃO / 1 ABST — 1º e 2º turnos em 14/07/2026',
    resumoFactual:
      'A emenda garante aposentadoria diferenciada aos agentes comunitários de saúde e de combate às endemias: 57 anos (mulheres) e 60 anos (homens), com 25 anos de contribuição e de exercício na atividade. Também exige vínculo efetivo e garante adicional de insalubridade.',
    pontosExplicativos: [
      {
        titulo: 'Aposentadoria aos 57/60 anos',
        texto:
          'Quem comprovar 25 anos de contribuição e de efetivo exercício como agente comunitário de saúde ou de combate às endemias pode se aposentar aos 57 anos (mulheres) e 60 anos (homens), tanto no regime próprio quanto no RGPS.',
      },
      {
        titulo: 'Regra de transição para quem já está na ativa',
        texto:
          'Para quem já estava no cargo, a idade mínima sobe em etapas: 50/52 anos até 2030; 52/54 até 2035; 54/56 até 2040; 57/60 a partir de 2041. Cada ano de contribuição acima de 25 reduz 1 ano da idade, até o limite de 5.',
      },
      {
        titulo: 'Vínculo efetivo e insalubridade',
        texto:
          'A emenda veda a contratação temporária ou terceirizada desses agentes, salvo emergência em saúde pública, e determina que eles se submetam ao regime de cargo efetivo. Também reconhece o direito ao adicional de insalubridade.',
      },
    ],
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
    status: 'SANCIONADA',
    normaOficial: 'Lei 15.358/2026',
    dataSancao: '2026-03-24',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/lei/l15358.htm',
    resultadoCamara: '370 SIM / 110 NÃO — 18/11/2025',
    resultadoSenado: '64 SIM / 0 NÃO — 10/12/2025',
    resumoFactual:
      'A Lei 15.358/2026 (Lei Raul Jungmann) criou o marco legal do combate ao crime organizado e tipificou os crimes de domínio social estruturado e de favorecimento ao domínio social estruturado, voltados a organizações ultraviolentas, grupos paramilitares e milícias privadas.',
    pontosExplicativos: [
      {
        titulo: 'O que é domínio social estruturado',
        texto:
          'É o crime praticado por integrante de organização criminosa ultraviolenta, grupo paramilitar ou milícia privada que usa violência ou grave ameaça para controlar territórios e comunidades, impedir a ação das forças de segurança ou impor controle sobre atividades econômicas (art. 2º).',
      },
      {
        titulo: 'Quem favorece também responde',
        texto:
          'A lei tipifica o favorecimento ao domínio social estruturado e altera o Código Penal, o Código de Processo Penal, a Lei dos Crimes Hediondos e a Lei de Execução Penal para alcançar quem apoia ou financia essas estruturas.',
      },
      {
        titulo: 'Sanção com veto parcial',
        texto:
          'O texto foi sancionado em 24/03/2026 com veto parcial (MSC 216/2026). O nome “Lei Raul Jungmann” homenageia o ex-ministro da Segurança Pública e da Justiça.',
      },
    ],
  },
  {
    slug: 'preco_energia',
    rotuloPopular: 'Aliviar o preço dos combustíveis (choque internacional)',
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
      nota: 'Votação nominal do Senado em 12/08/2026: 61 SIM × 2 NÃO. Virou a Lei Complementar 235/2026.',
      urlMateria: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/175446',
    },
    status: 'SANCIONADA',
    normaOficial: 'Lei Complementar 235/2026',
    dataSancao: '2026-08-27',
    urlNorma: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp235.htm',
    resultadoCamara: '318 SIM / 113 NÃO / 1 ABST — 12/08/2026',
    resultadoSenado: '61 SIM / 2 NÃO — 12/08/2026',
    resumoFactual:
      'A Lei Complementar 235/2026 abriu exceção extraordinária nas regras fiscais de 2026 para permitir renúncias de receita com o objetivo de aliviar o impacto do choque internacional de energia. As renúncias tratadas são sobre combustíveis — diesel, biodiesel, gasolina, etanol e querosene de aviação.',
    ressalva:
      'A lei não mexe na tarifa de energia elétrica: o alívio tratado é o de combustíveis. A compensação das renúncias depende de aumento extraordinário de receita da União e é demonstrada no Relatório Bimestral de Receitas e Despesas.',
    pontosExplicativos: [
      {
        titulo: 'O que a lei permite',
        texto:
          'Em caráter extraordinário, no exercício de 2026, as renúncias de receita para mitigar o choque de energia podem ser compensadas pelo aumento extraordinário de receita da União. A compatibilidade é demonstrada no Relatório Bimestral de Receitas e Despesas (art. 2º).',
      },
      {
        titulo: 'Quais combustíveis entram',
        texto:
          'As renúncias valem para diesel rodoviário, biodiesel, gasolina, etanol e querosene de aviação. A lei preserva a diferença competitiva dos biocombustíveis e determina que, se a gasolina tiver corte de 30% ou mais, o etanol também fique com alíquota zero (art. 2º, §§ 3º a 5º).',
      },
      {
        titulo: 'Não é conta de luz',
        texto:
          'O texto não define tarifa de energia elétrica. Ele também excepcionaliza benefícios tributários para minerais críticos, fertilizantes e a Copa do Mundo Feminina de 2027 — temas que não fazem parte do alívio ao consumidor de energia.',
      },
    ],
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
  bets: { apoio: 'Apoiou a regulamentação', divergente: 'Rejeitou a regulamentação' },
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
    'acaba com a escala 6x1: jornada de 40 horas e 2 dias de descanso por semana, sem reduzir salário.',
  bets:
    'as bets foram regulamentadas em 2023 e proibidas por MP em 2026; o Congresso ainda vai votar a proibição.',
  aposentadoria_agentes_saude:
    'aposentadoria com regra especial para agentes de saúde e de combate às endemias.',
  crime_organizado:
    'regras mais duras contra facções, alcançando também quem favorece ou financia o crime organizado.',
  preco_energia:
    'corta impostos de combustíveis (diesel, gasolina e etanol) no choque internacional — não é a conta de luz.',
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
    if (pauta.senado?.status === "arquivada") {
      return pauta.senado.nota;
    }
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
