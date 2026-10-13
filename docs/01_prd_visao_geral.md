# PRD — Visão Geral do Produto

> Documento convertido de `.docx` para Markdown (texto extraído automaticamente).
> O original está preservado em `docs/_originais/01_prd_visao_geral.docx`.
> Imagens e diagramas do original não são reproduzidos aqui.

---

PRD — Fiscal da Pátria
Especificação do Produto e Arquitetura Operacional
O Fiscal da Pátria é uma plataforma digital de transparência pública e auditoria cívica projetada para traduzir o comportamento legislativo da Câmara dos Deputados em dados acessíveis, diretos e visualmente compreensíveis pelo eleitor comum.

1. Visão Geral do Produto e Princípios Fundamentais
1.1 Missão
Reduzir a assimetria de informação entre a população e seus representantes eleitos, convertendo votações complexas do Congresso Nacional em métricas de impacto real na rotina do cidadão.
1.2 Pilares Estruturantes
Linguagem Popular e Direta: Eliminação do jargão jurídico-legislativo ("juridiquês"). Cada projeto é apresentado por seu impacto prático na vida real (ex.: bolso, saúde, segurança) em vez do número da Proposta de Emenda à Constituição (PEC) ou Projeto de Lei (PL).
Imparcialidade Factual Rigorosa: Ausência de adjetivação ou juízo de valor. O sistema limita-se a apresentar: o texto da ementa oficial, a explicação do impacto, a fonte pública e o registro nominal do voto de cada parlamentar (Sim, Não, Abstenção, Ausente).
Mecanismo Anti-Fake News: Rastreabilidade integral de dados diretamente da API Dados Abertos da Câmara dos Deputados. Cada página de parlamentar ou matéria possui link direto para a fonte oficial governamental, garantindo auditabilidade primária.
Estética Patriota Cívica (Verde e Amarelo): Design visual pautado por elementos cívicos republicanos, ressignificando as cores da bandeira nacional (Verde Mata #0F2F1D, Verde Bandeira #1B4D3E, Dourado/Amarelo Cívico #D9A726 e Fundo Neutro Claro #F8FAF9) em uma interface moderna, limpa e profissional.

2. As 7 Pautas Oficiais do MVP
Para garantir alta relevância social e comparabilidade direta no lançamento (MVP), o sistema mapeia 7 votações de alto impacto com tratamento específico para Inversão Semântica (situações onde o voto "SIM" representa rejeição ao benefício popular ou vice-versa, devido a destaques e substitutivos).
2.1 Tabela Integrada de Pautas do MVP
Pauta Popular
Ementa Oficial / Matéria
Impacto Real para o Cidadão
Tratamento de Inversão Semântica
1. Isenção da Cesta Básica
PL 2384/2023 & Reforma Tributária (PEC 45/2019)
Zeramento de impostos federais sobre itens essenciais da alimentação familiar.
Voto SIM = A favor do desconto nos alimentos. Mantido alinhamento direto.
2. Igualdade Salarial Homem/Mulher
PL 1085/2023 (Lei 14.611/2023)
OBRIGA empresas com +100 empregados a pagarem salários iguais para funções idênticas.
Voto SIM = A favor da igualdade de salários. Destaques de flexibilização invertidos para manter coerência.
3. Fim da Blindagem de Políticos
PEC 3/2021 (PEC da Imunidade)
Limitação da prisão em flagrante e foro privilegiado para deputados e senadores.
INVERSÃO: Voto NÃO na PEC = A favor do Fim da Blindagem. Voto SIM mantinha o privilégio.
4. Isenção de IR até 2 Salários Mínimos
PL 81/2024 (Lei 14.859/2024)
Isenta do Imposto de Renda trabalhadores que ganham até R$ 2.824,00 mensais.
Voto SIM = A favor de zerar o imposto. Alinhamento direto com o alívio financeiro.
5. Taxação dos Super-Ricos
PL 4173/2023 (Lei 14.754/2023)
Tributação de fundos exclusivos (offshores e fundos fechados de alta renda).
Voto SIM = A favor de taxar grandes fortunas. Sem inversão no texto final aprovado.
6. Teto do Juro do Cartão de Crédito
PL 2685/2022 / Desenrola (Lei 14.690/2023)
Limita o juro rotativo do cartão a no máximo 100% do valor da dívida original.
Voto SIM = A favor do teto nos juros. Inversão aplicada em destaques bancários de liberação.
7. Piso Salarial da Enfermagem
PL 2564/2020 & EC 124/2022
Fixa valor mínimo nacional para Enfermeiros, Técnicos, Auxiliares e Parteiras.
Voto SIM = A favor do salário mínimo da categoria. Alinhado ao texto final.

3. Fluxo e Mapeamento de Telas
O fluxo de navegação é desenhado para permitir o acesso à informação em no máximo 2 cliques (Two-Tap Access), otimizado para navegação mobile-first.

+-----------------------------------------------------------------------+

|  HEADER CÍVICO: Marca + Contador em Tempo Real ("42.180 Auditores")  |

+-----------------------------------------------------------------------+

                                   |

                                   v

+-----------------------------------------------------------------------+

|  MINI-HEMICICLO INTERATIVO: Gráficos de Proporção de Votos na Câmara |

+-----------------------------------------------------------------------+

                                   |

                                   v

+-----------------------------------------------------------------------+

|  CARROSSEL DE PILLS: [Cesta Básica] [IR 2SM] [Super-Ricos] [Enferm.]  |

+-----------------------------------------------------------------------+

                                   |

                                   v

+-----------------------------------------------------------------------+

|  BUSCA RÁPIDA: Campo de texto (Deputado) + Filtro de Estado (UF)      |

+-----------------------------------------------------------------------+

                                   |

                                   v

+-----------------------------------------------------------------------+

|  DOSSIÊ DO DEPUTADO: Fotos + Resumo + Botão Oficial da Câmara         |

+-----------------------------------------------------------------------+

                                   |

                                   v

+-----------------------------------------------------------------------+

|  CARTEIRINHA / SELO DO AUDITOR CÍVICO: Gerador de Card para Redes     |

+-----------------------------------------------------------------------+
3.1 Detalhamento dos Componentes UI/UX
Header Cívico com Prova Social: Exibe a marca do projeto e um widget dinâmico de contagem de acesso e compartilhamentos: "42.180 cidadãos já auditaram seus deputados hoje".
Mini-Hemiciclo da Câmara: Visualização vetorial simplificada no formato do plenário em semicírculo. As cadeiras mudam de cor conforme a pauta selecionada no carrossel (Verde = Votou a favor do benefício popular; Amarelo/Vermelho = Votou contra; Cinza = Ausente/Abstenção).
Carrossel de Pills: Menu horizontal com tags rápidas para alteração instantânea de contexto de votação.
Busca Rápida: Filtro combinado por autocompletar com nome parlamentar e seletor dropdown por estado (UF).
Dossiê do Deputado:
Foto oficial importada do portal da Câmara.
Partido, UF e índice de presença plenária.
Matriz das 7 pautas com indicativo claro de posição (SIM/NÃO).
Botão de Verificação: Link direto com suporte de rastreabilidade para o perfil oficial do deputado no domínio camara.leg.br.
Carteirinha/Selo do Auditor Cívico: Componente de geração de imagem dinâmica no browser (Canvas HTML5/WebRTC), permitindo que o usuário exporte um resumo do seu deputado com o carimbo "Audite Você Também".

4. Estratégia de Crescimento e Compartilhamento
A mecânica de distribuição do produto apoia-se em loops de viralidade orgânica voltados para a dinâmica de consumo de informação política no Brasil.
4.1 Vetores de Distribuição
Dark Social & WhatsApp First: Estruturação de dados otimizada para compartilhamento em aplicativos de mensagem instantânea.
Open Graph Dinâmico: Cada página gera um card com a imagem do deputado, sua UF e a frase: "Veja como o deputado [Nome] votou na Isenção da Cesta Básica e no Imposto de Renda".
Botão de acionamento direto: "Enviar no Grupo da Família" com texto pré-formatado.
Stories e Formato Vertical (9:16): Exportação nativa de cards no formato 1080x1920 pixels, otimizados para Instagram Stories, TikTok e WhatsApp Status.
Kit de Transparência para Micro-influenciadores: Exportador simplificado de relatórios consolidados por estado (ex.: "Os 7 Deputados do Rio de Janeiro que Votaram Contra a Igualdade Salarial"), permitindo que criadores de conteúdo produzam pautas embasadas em dados oficiais.

5. Guardrails Jurídicos e Eleitorais
Diante da sensibilidade dos dados e do ambiente regulatório brasileiro, a plataforma segue rigorosamente diretrizes jurídicas preestabelecidas.

                      MATRIZ DE CONFORMIDADE LEGAL

+------------------+--------------------------------------------------+

| Legislação       | Requisito Implementado                           |

+------------------+--------------------------------------------------+

| Resoluções TSE   | Ausência de pedido de voto e pedido de doação    |

| LAI (Lei 12.527) | Consumo exclusivo de dados públicos transparentes|

| LGPD (Lei 13.709)| Tratamento exclusivo de dados públicos de agentes|

| Código Aberto    | Repositório público com regras de transformação  |

+------------------+--------------------------------------------------+
5.1 Especificações Legais Compliants
Conformidade com Legislação Eleitoral (Resoluções TSE):
A plataforma não emite opinião, não recomenda voto e não faz uso de impulsionamento pago direcionado a candidatos específicos em período eleitoral.
Não há comercialização de espaço publicitário para agentes políticos.
Lei de Acesso à Informação (LAI - Lei 12.527/2011):
Todos os dados consumidos derivam da API de Dados Abertos do Poder Legislativo, respeitando a natureza pública das votações nominais.
Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018):
Dados processados dizem respeito exclusivamente ao exercício do mandato público de agentes políticos (Art. 7º, § 4º da LGPD - dados tornados manifestamente públicos pelo titular/órgão).
O aplicativo não exige cadastro pessoal obrigatório para consulta básica de dados.
Auditoria por Código Aberto (Open Source):
As regras de de-para da conversão de votos e tratamento de inversão semântica possuem repositório aberto e auditável no GitHub, garantindo que qualquer cidadão possa checar o algoritmo de classificação do sistema.
