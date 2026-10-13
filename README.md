# Fiscal da Pátria

Plataforma cívica de transparência e auditoria das votações nominais do **Congresso Nacional**:
**513 deputados federais + 81 senadores (594 parlamentares)** em 11 pautas.
Traduz o comportamento legislativo em linguagem popular ("Comida sem imposto", "Salário livre de IR")
e mostra como cada parlamentar votou — sempre com link para a fonte oficial da casa onde a votação ocorreu.

## Princípios inegociáveis
- **Linguagem popular** e impacto real no bolso/prato do cidadão.
- **Tolerância zero a desinformação:** apenas votações nominais da API oficial (`dadosabertos.camara.leg.br`) e link para a fonte em cada card.
- **Inversão semântica** respeitada (ex.: na PEC da Blindagem, votar **NÃO** é defender o povo).
- **Zero database em runtime:** o app lê `public/data/parlamentares.json` (estático).
- **Estética cívica**, sem viés partidário.

## Stack
Next.js (App Router) + React + TypeScript + Tailwind CSS v4 + lucide-react + html-to-image + canvas-confetti.

## Como rodar
```bash
npm install
npm run dev        # http://localhost:3000
```

## Pipeline de dados (build-time)
Os dados vêm da API oficial e são consolidados em arquivos estáticos:
```bash
npm run update-all     # = update-data + fetch-fotos
# ou separadamente:
npm run update-data    # baixa as votações e gera public/data/parlamentares.json
npm run fetch-fotos    # baixa as fotos oficiais para public/fotos/
```
> **Sem dados fictícios.** Se a API falhar, o script aborta e **não sobrescreve** o JSON existente.

## Scripts
| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (inclui type-check) |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run update-data` | Ingestão unificada Câmara + Senado (API oficial) |
| `npm run fetch-senado` | 81 senadores, fotos e votos nominais do Senado + auditoria |
| `npm run fetch-tse` | Votos de urna (TSE **2018 e 2022**) de deputados e senadores |
| `npm run fetch-fotos` | Download das fotos oficiais dos deputados |
| `npm run update-all` | `update-data` + `fetch-fotos` |

## Estrutura
```
src/app/          layout, página inicial e estilos (paleta cívica)
src/app/          layout, home, /sobre (manifesto) e /poderes (educação cívica)
src/components/   SiteHeader, CargoTabs, Hemiciclo, PautaPills, BuscaFiltros,
                  ParlamentarCard, DossieModal, CitizenBadgeCard, CardPauta,
                  GraficoPartidos
src/lib/          pautas (10 pautas + regra de inversão), parlamentares (helpers)
src/types/        contratos de dados
scripts/          fetch_votes.ts (ingestão unificada), fetch_senado.ts, fetch_tse_votos.ts, fetch_fotos.ts
public/data/      parlamentares.json (consolidado: 513 deputados + 81 senadores)
public/fotos/     fotos oficiais dos deputados e senadores
public/           og-image.png (1200x630), favicon.ico, apple-touch-icon.png,
                  icon-192.png, icon-512.png, manifest.webmanifest (PWA)
```

## As 11 pautas do MVP
**Auditadas na Câmara (8):**
1. Comida sem imposto (Cesta Básica) — PEC 45/2019
2. Salário igual para trabalho igual — PL 1085/2023
3. **Fim da blindagem de políticos** — PEC 3/2021 _(invertida)_
4. Salário livre de IR — PL 1087/2025
5. Cobrar imposto dos super-ricos — PL 4173/2023
6. Teto para o juro do cartão — PL 2685/2022
7. Piso salarial da enfermagem — PL 2564/2020
8. **Fim da escala 6x1 (jornada de 36 horas)** — PEC 221/2019 _(plenário 27/05/2026: 472 Sim × 22 Não)_

**Auditadas no Senado (3):**
9. Aposentadoria dos agentes de saúde e de endemias — PEC 14/2021
10. Lei mais dura contra o crime organizado — PL 5582/2025
11. Aliviar o preço da energia (choque internacional) — PLP 114/2026

> Os senadores ficam `NAO_APLICAVEL` (com motivo visível na ficha) nas pautas 1–8, e os deputados nas 9–11:
> cada pauta é auditada na casa onde houve **votação nominal**.

## Compartilhar focado na matéria (a pauta no centro)
Cada matéria tem seu próprio texto pronto para o Zap:
- **No card da pauta** (home): botão **"📲 Compartilhar esta votação"** → *"🚨 Votação no Congresso: Comida sem imposto (Cesta Básica)…"* + link `/?pauta=cesta_basica`.
- **No dossiê**: botão **"Enviar esta votação"** em cada uma das 10 pautas → *"🚨 Comida sem imposto (PEC 45/2019) — nesta votação, Fulano (PL-RJ), deputado federal, votou CONTRA o cidadão. Voto registrado: NÃO."* + link `/?deputado=…&pauta=…`.
- **Cartão da pauta** (PNG 1080×1350): a matéria no topo, o parlamentar e o veredito colorido — ideal para story/status.

## Gráfico por partido
O bloco **"Como cada partido votou"** mostra, para a pauta ativa, uma barra empilhada percentual por bancada
(a favor / contra / abstenção / ausente / sem voto individual), **ordenada pelos partidos com mais votos**
(bancada maior primeiro) e, no **desempate**, por quem mais votou **CONTRA o cidadão**, com o **% de votos
contrários** em destaque e a fatia da Casa ("132 (22% da Casa)").
A lista vem **colapsada em 5 partidos**, com o botão "Ver todos os N partidos" (e "mostrar menos") para
não virar um paredão de informação. Respeita os filtros de cargo, UF e busca — e fica **ao lado do
hemiciclo**, abaixo do card da matéria. Calculado no cliente, sem requisição extra.

## Ordens disponíveis na lista
| Ordem | O que faz |
|---|---|
| ⚠️ **Divergentes primeiro (Padrão)** | quem rejeitou a proposta no topo; desempate pelos mais votados |
| ⚖️ Placar equilibrado (Intercalado) | 1 divergente, 1 favorável, 1 divergente… — dá visibilidade às **duas** pontas |
| ✅ Favoráveis primeiro | quem apoiou a proposta no topo (mesmo desempate) |
| 🗳️ Mais votados nas urnas | ignora o voto; ordena pela votação do TSE |
| 🔤 Ordem alfabética (A-Z) | por nome |

## Senado: por que existe `NAO_APLICAVEL`
O Senado aprova a maioria das matérias por **votação simbólica** — não há voto individual registrado.
Das 7 pautas da Câmara, só a **PEC 45/2019** teve votação nominal no Senado (08/11/2023, 48 SIM × 22 NÃO).
Marcar esses senadores como "Ausente" seria **desinformação**, então o app usa um estado próprio,
`NAO_APLICAVEL`, com o motivo escrito na ficha ("aprovada em votação simbólica… Virou a Lei 14.611/2023").
O mesmo vale para os deputados nas pautas do Senado. A verificação é reexecutável:
`scripts/data/senado_votacoes_map.json` guarda a auditoria (código da votação, data, totais e fonte).

## Deep links (Dark Social)
A home aceita parâmetros na URL, então todo link colado no grupo já abre no lugar certo:

| Link | Efeito |
|---|---|
| `/?deputado=camara-74646` (ou `?dep=74646` / `?id=`) | abre direto o dossiê (aceita o id antigo, só o número) |
| `/?busca=Aécio` (ou `?q=PSDB`) | entra com a lista já filtrada por nome/partido |
| `/?pauta=fim_blindagem` | pré-seleciona a pauta |
| `/?cargo=SENADOR` | abre já na aba dos 81 senadores |
| `/?busca=PSDB&pauta=fim_blindagem` | combina busca + pauta |

Abrir ou fechar um dossiê atualiza a barra de endereço, então o endereço visível é sempre copiável.

## Card no WhatsApp e ícones
`public/og-image.png` (1200×630, paleta cívica) somada ao `metadata` de `src/app/layout.tsx` gera o card
verde e amarelo no WhatsApp, Telegram e X — com **URL absoluta** da imagem (sem isso o crawler não monta
a miniatura). `public/favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png` e `manifest.webmanifest`
deixam o site instalável na tela inicial do celular.

## Guardrails legais
Dados exclusivamente públicos (Lei de Acesso à Informação — 12.527/2011), sem pedido de voto nem
comercialização de espaço (Resoluções TSE). O rodapé de todas as páginas traz a declaração de isenção:
iniciativa cívica voluntária, independente e sem fins lucrativos, sem vínculo com partidos políticos,
candidatos ou órgãos estatais. Regras de transformação (inversão semântica) auditáveis neste repositório.

## Documentação
- **[`docs/00_planejamento_por_etapas.md`](docs/00_planejamento_por_etapas.md)** — registro por etapas (o que já foi feito + próximos passos).
- **[`docs/README.md`](docs/README.md)** — índice dos documentos (PRD, arquitetura, manifesto).
- Os documentos originais em `.docx` ficam preservados em `docs/_originais/`.

## Testes E2E (Playwright)
Suíte completa (**96 testes**) que valida o front no Chrome: render/dados, **Congresso (594: 513 deputados + 81 senadores)**, **abas e badges por cargo**, filtros (**inclui estado vazio com "Limpar filtros"**), pautas/hemiciclo (**10 pautas**), **ordenação por gravidade com desempate pelos mais votados**, dossiê, export da carteirinha, **compartilhamento (WhatsApp/Telegram/X/Copiar)**, **deep links**, **OpenGraph / ícones / manifest PWA**, **rodapé jurídico**, **dark mode**, página `/sobre`, integridade dos dados (**inclui a regra de ouro: votação simbólica do Senado nunca vira "Ausente"**) e **acessibilidade (axe) em claro e escuro** — além de responsividade mobile.
```bash
npm run test:e2e     # sobe o dev server e roda os specs em tests/
```
Usa o **Google Chrome instalado** (`channel: "chrome"`), sem baixar navegador. Evidências em `playwright-shots/`.
