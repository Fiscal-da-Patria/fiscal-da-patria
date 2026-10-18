# Planejamento por Etapas — Fiscal da Pátria

> **Registro vivo do projeto.** Acompanha o que **já foi feito**, o que **está em andamento** e o que **vem a seguir**, com as decisões tomadas em cada etapa.
> As seções técnicas detalhadas ficam no **Apêndice A** (ao final deste documento).

## Painel de etapas

| # | Etapa | Objetivo | Status |
|---|---|---|---|
| 1 | Setup do projeto | Next.js (App Router) + TS + Tailwind + estrutura de pastas | ✅ |
| 2 | Pipeline de dados da Câmara | 7 pautas da API oficial → `public/data/parlamentares.json` | ✅ |
| 3 | UI + Carteirinha/Selo | Home (hemiciclo, filtros, dossiê) + card 9:16 | ✅ |
| 4 | Fotos oficiais | Download local (resolve o CORS) e uso no card | ✅ |
| 5 | Validação | Integridade, links, runtime e reprodutibilidade | ✅ |
| 6 | Página "Sobre Nós / Manifesto" | Página institucional + acessos no header/rodapé | ✅ |
| 7 | Suíte E2E | Playwright + axe (render, dados, a11y, mobile) | ✅ |
| 8 | Compartilhamento WhatsApp | Botão viral + deep links | ✅ |
| 9 | SocialShareBar | Telegram, X, Copiar Link e Web Share | ✅ |
| 10 | Dark mode + contraste AA | Tema claro/escuro e acessibilidade | ✅ |
| 11 | Ordenação por relevância | CONTRA no topo, seletor e banner | ✅ |
| 12 | Base de votos do TSE | TSE 2022 — votos oficiais de 600 deputados | ✅ |
| 13 | Acabamento do MVP V1 | OpenGraph, deep links, estados vazios, rodapé jurídico, ícones/PWA | ✅ |
| 14 | Congresso completo (Câmara + Senado) | 594 parlamentares · 10 pautas · cargo/tabs · TSE 2018+2022 | ✅ |
| 15 | Refinos de visibilidade e viralidade | Pills que quebram linha · pauta no Zap · cartão 4:5 · gráfico por partido | ✅ |
| 16 | Pauta nova: fim da escala 6x1 | PEC 221/2019 auditada — 11 pautas (depois promulgada: Etapa 21) | ✅ |
| 17 | Página "Entenda os Poderes" | Educação cívica: os 3 Poderes + Câmara × Senado | ✅ |
| 18 | Régua dos votos + Linha do tempo | Quóruns (PEC 308/49 · PLP 257/41 · PL) e o funil legislativo em 5 passos | ✅ |
| 19 | Revisão de leitura e usabilidade | Manifesto no topo · rótulo único · rodapé único · casa sem voto · lista 20 em 20 | ✅ |
| 20 | Simplificação: sem dossiê/nota + cartão de compartilhamento | Um botão por card gera a imagem (nome, partido, matéria, voto) | ✅ |
| 21 | Escala 6x1 promulgada (EC 141/2026) | Dados definitivos das duas Casas + card "O que foi aprovado?" | ✅ |
| 22 | Deploy | Publicação (Vercel/Cloudflare Pages) + domínio | ⏳ próxima |
| 23 | Otimização de fotos (WebP) | Reduzir o peso de `public/fotos` | ⏳ backlog |
| 24 | OG dinâmico / Kit por estado | Crescimento e viralidade | ⏳ backlog |

## Registro por etapa

### Etapa 1 — Setup ✅
- **Objetivo:** inicializar Next.js (App Router, TS, Tailwind) **sem perder** `docs/` e `.clinerules`.
- **Feito:** scaffold em pasta temporária + merge; dependências (`lucide-react`, `html-to-image`, `canvas-confetti`, `tsx`, `@types/canvas-confetti`); paleta cívica; pastas `public/data`, `scripts`, `src/{components,lib,types}`.
- **Verificação:** `build` e `lint` OK. *(Os binários nativos SWC/lightningcss vieram truncados no 1º install → reinstalados.)*

### Etapa 2 — Pipeline de dados ✅
- **Objetivo:** consolidar as votações nominais da Câmara em um JSON estático.
- **Feito:** `scripts/fetch_votes.ts`, `src/lib/pautas.ts` (regra única de inversão), `src/types/parlamentar.ts` → **751 deputados**.
- **Decisões:** IDs reais das 7 pautas; IR → **PL 1087/2025** (o PL 81/2024 não teve voto nominal de mérito); teto do cartão → votação "Mantido o texto"; **sem mock** (falha da API não sobrescreve o JSON); matriz **densa** (`AUSENTE` explícito).
- **Verificação:** reconciliação dos votos bate com as descrições oficiais.

### Etapa 3 — UI + Carteirinha/Selo ✅
- **Feito:** `SiteHeader`, `Hemiciclo`, `PautaPills`, `BuscaFiltros`, `ParlamentarCard`, `DossieModal`, `CitizenBadgeCard` + `src/app/page.tsx`.
- **Verificação:** build/lint OK; servidor responde 200.

### Etapa 4 — Fotos oficiais ✅
- **Feito:** `scripts/fetch_fotos.ts` → **751/751** fotos em `public/fotos/`; o campo `foto` passou a ser local.
- **Motivo:** as fotos da Câmara **não enviam CORS** → o card exportável usa imagem *same-origin*.

### Etapa 5 — Validação ✅
- **Feito:** integridade (7 pautas, 751 deputados, inversão da Blindagem, scores, links), runtime 200 e **reprodutibilidade** (`update-all` 2× → SHA-256 idêntico).

### Etapa 6 — Página "Sobre Nós" ✅
- **Feito:** `src/app/sobre/page.tsx` (texto do doc 04) + `SiteFooter` com "Manifesto Cívico & Transparência" e link no header.

### Etapa 7 — Suíte E2E ✅
- **Feito:** Playwright no **Chrome instalado** + `@axe-core/playwright`; specs por área (home, filtros, pautas, dossiê, sobre, dados, a11y, mobile, visual).

### Etapa 8 — Compartilhamento WhatsApp ✅
- **Feito:** `WhatsAppShareButton` + mensagem oficial (`encodeURIComponent`) + **deep links** `?deputado=` / `?pauta=`.

### Etapa 9 — SocialShareBar ✅
- **Feito:** `src/lib/share.ts` + `SocialShareBar` (WhatsApp · Telegram · X · Copiar Link com feedback · Web Share) no rodapé, em `/sobre` e no modal.

### Etapa 10 — Dark mode + contraste AA ✅
- **Feito:** tokens semânticos + `.dark`, script anti-flash, `ThemeToggle`; contraste **AA** em todos os botões; axe **sem exceções** (claro/escuro + dossiê aberto).
- **Verificação:** **57 testes E2E verdes**, `lint` e `build` OK.

### Etapa 11 — Ordenação por relevância ✅
- **Objetivo:** priorizar a gravidade do voto na pauta ativa e permitir reordenar a lista.
- **Feito:** `ordenarParlamentares()` (CONTRA → FAVORÁVEL → ABSTENÇÃO/AUSENTE, com desempate por `votosEleicao` decrescente e, por fim, nome), **seletor** "Piores / Melhores / A-Z" na barra de filtros, **banner** contextual e **destaque do status da pauta** no card (+ `data-nome` para testes).
- **Decisões:** "Piores votos primeiro" é o padrão ao selecionar uma pauta; `votosEleicao` vem de `scripts/data/tse_deputados_votos.json` (mapa oficial **a preencher** — sem números inventados; ausentes = 0 → desempate alfabético).
- **Verificação:** **68 testes E2E verdes** (inclui unidade da ordenação), `lint` e `build` OK.

### Etapa 12 — Base de votos do TSE ✅
- **Objetivo:** ativar o desempate "mais votados primeiro" com dados **oficiais** das urnas.
- **Fonte:** TSE — Repositório de Dados Eleitorais, `votacao_candidato_munzona_2022_{UF}.csv` (do zip oficial de 2022).
- **Feito:** `scripts/fetch_tse_votos.ts` (streaming em ISO-8859-1, filtro *Deputado Federal*, match por `NOME|UF`) → `scripts/data/tse_deputados_votos.json` com **600 de 751** deputados (os demais não concorreram em 2022 → `votosEleicao = 0`).
- **Amostra verificada:** Nikolas Ferreira (MG) **1.492.047** · Guilherme Boulos (SP) **1.001.472** · Carla Zambelli (SP) **946.244**.
- **Verificação:** `update-data` mesclou os votos no JSON; `lint`, `build` e suíte E2E verdes.

### Etapa 13 — Acabamento do MVP V1 ("pronto para o Zap") ✅
- **Objetivo:** fechar os 5 itens sem os quais o MVP vaza credibilidade: card no WhatsApp, link compartilhável, estados de tela, blindagem jurídica e ícones de app.
- **1. OpenGraph estático:** `metadata` completo em `src/app/layout.tsx` (`metadataBase`, `openGraph`, `twitter:summary_large_image`, `robots`, `themeColor`) + **`public/og-image.png` (1200×630)** desenhada com a paleta cívica → o link abre card verde/amarelo no WhatsApp, Telegram e X.
- **2. Deep linking:** a home entende `?deputado=` · **`?dep=`** · `?id=` (abre o dossiê e **normaliza** a URL para `?deputado=`) e `?busca=` · **`?q=`** (entra com a lista já filtrada); abrir/fechar o dossiê atualiza a barra de endereço (`history.replaceState`) → o link do grupo da família abre exatamente na ficha do deputado.
- **3. Estados de loading e tela vazia:** spinner + origem oficial ao carregar; resultado vazio com mensagem acolhedora e botão **"Limpar filtros"** (zera busca, UF, ordem e a URL); falha de dados com botão **"Recarregar"** — a interface nunca fica em branco.
- **4. Rodapé jurídico cívico:** declaração de isenção em **todas** as páginas — iniciativa voluntária, independente e sem fins lucrativos; sem vínculo com partidos, candidatos ou órgãos estatais; dados públicos do `dadosabertos.camara.leg.br` conforme a **LAI (Lei 12.527/2011)**.
- **5. Favicon e ícones PWA:** `public/favicon.ico` (ICO com PNG embutido), `apple-touch-icon.png` (180×180), `icon-192.png`/`icon-512.png` e `public/manifest.webmanifest` (`standalone`, tema cívico) → fixar na tela inicial parece app nativo.
- **Verificação:** specs novos `tests/seo.spec.ts` (OG/X, ícones, manifest, rodapé jurídico) e `tests/deep-links.spec.ts` (aliases, URL copiável, link inválido) + 2 casos de estado vazio no `filtros.spec.ts`; `lint` e `build` OK.

### Etapa 14 — Congresso completo (Câmara + Senado) ✅
- **Objetivo:** auditar **todo o Congresso** no MVP V1 — 513 deputados federais + 81 senadores = **594 parlamentares**.
- **Pesquisa nas fontes oficiais do Senado** (verificada antes de escrever código):
  - `/senador/lista/atual.json` → 81 senadores em exercício ✅
  - `/dadosabertos/votacao` (JSON, 89 votações de 2025–2026) → **votos individuais** já incluídos ✅
  - `/plenario/lista/votacao/{dia}/{dia}` → painel nominal; devolve **XML por padrão e JSON quando o `Accept` pede JSON** (descoberta importante) ✅
  - `/plenario/votacao/{codigo}` → **404**: o endpoint do PRD não existe; o caminho correto é a lista por período.
- **Achado que mudou o produto:** das 7 pautas, **só a PEC 45/2019 teve votação nominal no Senado** (08/11/2023, código 6773 — 48 SIM × 22 NÃO). As outras foram **aprovadas por votação simbólica** (sem voto individual registrado) ou ainda pendentes. Por isso os senadores recebem **`NAO_APLICAVEL`** com o motivo explícito ("aprovada em votação simbólica… Virou a Lei X"), e **nunca `AUSENTE`** — marcar falta ali seria desinformação.
- **Pautas nativas do Senado (escolha B):** +3 matérias com **votação nominal real** no plenário do Senado — `aposentadoria_agentes_saude` (PEC 14/2021), `crime_organizado` (PL 5582/2025) e `preco_energia` (PLP 114/2026) → **10 pautas** no total. Os deputados ficam `NAO_APLICAVEL` nelas, com o motivo explicando o escopo.
- **Modelo de dados** (`src/types/parlamentar.ts`): `CargoParlamentar`, **`AlinhamentoVoto` com `NAO_APLICAVEL`**, `id: string` **namespaced** (`camara-74646` | `senado-5894`, evita colisão), `fotoUrl`, `pontuacaoCivica`, `votos: Record<string, AlinhamentoVoto>` — mais `votosOriginais` (o que o parlamentar apertou) e `motivos` (por que não há voto a julgar) para auditoria.
- **Pipeline:** `scripts/fetch_senado.ts` (81 senadores + 81 fotos locais + votos + **auditoria** em `scripts/data/senado_votacoes_map.json`), `scripts/fetch_tse_votos.ts` estendido (**2018 + 2022**, cargos Deputado e Senador, colunas descobertas **pelo cabeçalho**) e `scripts/fetch_votes.ts` unificado → `public/data/parlamentares.json` com 594.
- **Deputados agora são só os 513 em exercício** (a base antiga somava 751 por incluir suplentes que votaram em legislaturas passadas).
- **Votos de urna (TSE):** **508 parlamentares** com votos reais — 453/513 deputados e 55/81 senadores. Amostra validada: **Flávio Bolsonaro 4.380.418** e Astronauta Marcos Pontes 10.714.913.
- **Índice de Alinhamento Cívico** passa a dividir apenas pelas **pautas aplicáveis** (exclui `NAO_APLICAVEL`) — ninguém é punido por voto que não existiu.
- **UI:** abas `Todos (594)` · `Deputados Federais (513)` · `Senadores (81)`; **tag de cargo** no card (verde para deputado, âmbar para senador) + sigla da UF; 4 ordenações (`🚨 Piores` · `⭐ Melhores` · **`🗳️ Mais votados na eleição`** · `🔤 A-Z`) na cascata exata do PRD; banner "quem votou CONTRA o cidadão… (ordenados pelos mais votados)"; **busca unificada** (Nikolas, Boulos, Flávio Bolsonaro, Moro); hemiciclo respeita o filtro de cargo; dossiê mostra a **situação da matéria no Senado** e o voto bruto registrado.
- **Deep links:** `?cargo=SENADOR` abre a aba; `?deputado=` aceita o id antigo (só o número) e o namespaced.
- **Verificação:** **96 testes E2E verdes** — nova spec `tests/cargo.spec.ts` + `ordenacao.spec.ts` com os dois casos novos (`maisVotados`, `NAO_APLICAVEL` no fim) + `api-dados.spec.ts` validando a **regra de ouro do Senado** (pauta simbólica nunca vira "Ausente"); `lint` e `build` OK.

### Etapa 15 — Refinos de visibilidade e viralidade ✅
- **1. Pautas em pills que quebram linha:** `PautaPills` deixou a rolagem horizontal (`overflow-x-auto`) e passou a **`flex-wrap`** — as **10 pautas** ficam visíveis no celular (a última, do Senado, não fica mais escondida atrás do scroll).
- **2. Compartilhar a PAUTA como assunto central:** `mensagemPauta()` + `urlPauta()` no botão "📲 Compartilhar esta votação" do card da matéria; e, no dossiê, **um botão por pauta** (`mensagemParlamentarNaPauta()` + `urlParlamentarNaPauta()`) com o texto pronto:
  > *"🚨 Comida sem imposto (PEC 45/2019) — nesta votação, Fulano (PL-RJ), deputado federal, votou CONTRA o cidadão. Voto registrado: NÃO."* + link `?deputado=…&pauta=…`
- **3. Cartão exportável da pauta (PNG 4:5):** novo `CardPauta` (1080×1350) com a **matéria no topo** (rótulo popular + ementa oficial), o parlamentar e o veredito colorido ("Contra o cidadão · voto registrado: NÃO") — aparece no dossiê para a pauta ativa.
- **4. Gráfico "Como cada partido votou":** novo `GraficoPartidos` — **barra empilhada percentual por partido** (a favor / contra / abstenção / ausente / sem voto individual), com o **% de votos CONTRA o cidadão** em destaque, ordenado pelo tamanho da bancada e respeitando os filtros de cargo/UF/busca. Tudo calculado no cliente (sem refetch).
- **5. Layout do topo (ajuste pedido):** o **card da matéria (resumo da PEC)** fica sozinho em cima, em largura total; **abaixo**, o **hemiciclo e o gráfico por partido lado a lado** (2 colunas no desktop, empilhados no celular).
- **6. Gráfico por partido — ordenação e collapse:** a lista é ordenada por **quem mais votou CONTRA o cidadão** (as bancadas mais danosas no topo, com o tamanho da bancada ao lado) e vem **colapsada em 5 partidos**, com botão **"Ver todos os N partidos" / "Mostrar menos"** (`aria-expanded`) para não virar um paredão de informação.
- **7. Ordenação intercalada na lista de pessoas:** nova opção **`🔀 Intercalado (contra × a favor)`** — mostra 1 CONTRA, 1 A FAVOR, 1 CONTRA… (sempre pelos mais votados de cada lado) e depois abstenção/ausente/sem voto individual, dando **visibilidade também a quem votou a favor**. A ordem padrão segue **`🚨 Piores votos primeiro`** (promessa do PRD e motor da viralização); trocar o padrão é 1 linha.
- **Verificação:** `tests/pauta-partido.spec.ts` reescrito e `tests/ordenacao.spec.ts` com os casos novos — **25 testes verdes** nos dois specs afetados (intercalado na unidade e na tela, 1ª bancada = a que mais votou contra, collapse em 5 + expandir/recolher, e hemiciclo × gráfico lado a lado medidos por `boundingBox`).
- **Lição aprendida (processo):** um dev server antigo foi reutilizado com **módulos velhos** e escondeu um `ReferenceError` (import faltante do `ROTULO_VOTO_BRUTO`); a regra passou a ser **reiniciar o servidor de desenvolvimento** depois de mudanças estruturais, antes de rodar a suíte.

### Etapa 16 — Pauta nova: fim da escala 6x1 ✅
- **Pedido:** incluir a votação da escala **6x1** (a mais quente do momento).
- **Rigor de fonte (nada inventado):** busca na API oficial da Câmara → **PEC 221/2019** (`idProposicao 2233802`), ementa oficial *"Altera o art. 7º, inciso XII, da Constituição Federal, reduzindo a jornada de trabalho a 36 horas semanais, em 10 anos"*.
- **Votação-chave curada:** **`2233802-424`** — 1º turno no plenário em **27/05/2026**: **472 Sim × 22 Não × 1 Obstrução** (495 registros). O 2º turno (`-438`) veio com 461 Sim; usamos o 1º turno (mérito), como nas outras PECs.
- **Senado:** varredura no catálogo oficial (89 votações nominais de 2025–2026) → **nenhum registro** para a PEC 221/2019 ⇒ a matéria entra como `pendente` ("Nenhum registro de votação nominal no Senado até 12/10/2026") e os senadores ficam `NAO_APLICAVEL` — nunca "Ausente".
- **Semântica:** `invertida: false` (SIM = acabar com a 6x1 = a favor do cidadão).
- **Pipeline:** `update-data` reexecutado → reconciliação oficial **SIM=460 / NÃO=20** entre os 481 deputados em exercício que votaram; o JSON foi regravado com **594 registros × 11 pautas**.
- **Rótulo popular:** "Fim da escala 6x1 (jornada de 36 horas)" — aparece como 8ª pill, no dossiê, no gráfico por partido e no compartilhamento focado na pauta.
- **Verificação:** testes atualizados (11 pautas nas matrizes, no dossiê — 11 botões "Enviar esta votação" e 11 links de fonte oficial — e nas pills) e specs afetados reexecutados.

### Etapa 17 — Página "Entenda os Poderes" ✅
- **Objetivo:** educação cívica em linguagem popular — explicar os **3 Poderes** e deixar claro **por que** o projeto fiscaliza o Legislativo.
- **Rota:** `src/app/poderes/page.tsx` (server component, metadados próprios de SEO/OG) + links no **menu superior** (rótulo curto "Poderes" no mobile; no desktop o rótulo virou **"Como Funciona"** na Etapa 18) e no **rodapé** ("Entenda os 3 Poderes e Leis") — âncoras `#regua` e `#linha-do-tempo` para os atalhos contextuais.
- **Diagrama responsivo:** grid `1 coluna no mobile → 3 no desktop` (`md:grid-cols-3`), data-driven (`PODERES[]` + `data-poder` para testar):
  - **Legislativo** em destaque máximo: `border-2 border-dourado` + `ring-verde-bandeira`, ícone em selo dourado, `md:-mt-2` (levemente elevado) e a tag **"🎯 O foco do Fiscal da Pátria: é aqui que seu bolso é decidido!"** + CTA "Ver como cada um votou".
  - **Executivo** (Building2) com o lembrete *"Não cria leis nem impostos sozinho: depende do aval do Legislativo"*.
  - **Judiciário** (Gavel) com o lembrete *"Julga de acordo com as leis aprovadas pelos deputados e senadores que você elegeu"*.
- **Seção Câmara × Senado:** "Deputados Federais — a voz do povo" (513, número varia pela população) × "Senadores — a voz dos estados" (3 por estado, 81 no total, equilíbrio da Federação).
- **Fechamento:** bloco explicando por que auditamos o Legislativo, com link para `/sobre#metodologia`.
- **Verificação:** nova spec `tests/poderes.spec.ts` (7 casos: conteúdo dos 3 Poderes, destaque dourado só no Legislativo, Câmara × Senado, **grid medido por `getBoundingClientRect`** no mobile/desktop, botão de retorno, acesso pelo header/rodapé e o fechamento) + `/poderes` incluída nas **6 checagens de acessibilidade (axe) em claro e escuro** — **26 testes verdes** nos specs afetados.

### Etapa 18 — Régua dos votos + Linha do tempo (aprofundar a Cidadania) ✅
- **Objetivo:** sair do "quem faz o quê" para o **como se decide**: quantos votos cada tipo de matéria exige e por quais etapas uma lei passa (o funil legislativo).
- **Régua dos votos (`#regua`):** 3 cartões data-driven (`QUORUNS[]` + `data-quorum`), com **números conferidos na Constituição** (arts. 47, 60 §§ 2º/3º e 69):
  - **PEC** — 3/5 dos votos = **308** (de 513) e **49** (de 81); **2 turnos** em cada Casa; **sem sanção nem veto** (promulgada pelo Congresso).
  - **PLP** — maioria absoluta = **257** e **41**; 1 turno e vai à sanção/veto.
  - **PL** — **maioria simples**: "mais votos SIM do que NÃO entre os presentes" (o art. 47 exige a maioria absoluta presente para a sessão deliberar: 257/41). *Decisão editorial: **não** inventar número para a maioria simples — ela varia com a presença.*
- **Nota de método:** a conta é sobre o **total de cadeiras** (513/81), não sobre os presentes — cadeira vazia não derruba a barra. Cada cartão mostra a **base legal** (`data-quorum-base`) e o bloco final linka a **Constituição no Planalto** (domínio oficial).
- **Linha do tempo (`#linha-do-tempo`):** `ETAPAS[]` com 5 passos (`data-etapa`), ícones Lucide (`FilePlus2`, `Filter`, `Users`, `Landmark`, `Gavel`) e **um único DOM** que gira de eixo só por CSS: vertical no mobile (trilho à esquerda) → horizontal no desktop (`md:flex`, trilho no topo). Conteúdo: nascimento da proposta → **filtro das comissões (a CCJ pode barrar)** → plenário da Câmara (o foco do Fiscal) → Senado como Casa revisora (rejeita e arquiva · aprova · ou devolve à Câmara) → sanção, veto e **derrubada do veto** em sessão conjunta.
- **Navegação:** header **"Como Funciona"** (mobile: "Poderes") e rodapé **"Entenda os 3 Poderes e Leis"**.
- **Atalhos contextuais:** na home (bloco da pauta selecionada) e no dossiê (colado na votação em destaque) aparece **"ℹ️ O que é preciso para aprovar uma PEC?"** quando a matéria é PEC (→ `#regua`) e **"ℹ️ Como uma lei é aprovada?"** quando é PL/PLP (→ `#linha-do-tempo`) — marcados com `data-ajuda-tramitacao` / `data-ajuda-quorum`.
- **Duas correções achadas pelo `axe` no dossiê (a11y + transparência):**
  1. as linhas "neutras" (sem voto/abstenção) usavam **`opacity-70`** — o axe mede o contraste **efetivo**, e a opacidade derrubava o texto (**3 violações `color-contrast`**, todas nessas linhas); trocado por `bg-trilha/40` (destaque visual mantido, contraste AA garantido);
  2. o **motivo** da ausência (ex.: "votação simbólica no Senado") tinha ficado só dentro do popover ⓘ — voltou **inline** na linha, truncado em 1 linha (transparência sem perder o layout compacto).
- **Dois testes obsoletos travavam a suíte inteira (a causa do "stall" nas execuções completas anteriores):**
  1. `tests/casa-sem-voto.spec.ts` procurava a aba pelo nome antigo (`Senadores (81 · 0 votaram)`) — o clique nunca casava o locator e a suíte **parava por timeout** ali. Corrigido para `Senadores (81) · 0 votaram`, o mesmo padrão das demais asserções;
  2. `tests/pautas-hemiciclo.spec.ts` lia a legenda `/A favor do cidadão:/` — texto **removido** no refactor editorial de conformidade; o `innerText()` esperava o timeout inteiro e a suíte parava no teste 103. Agora valida os **rótulos factuais por pauta** (`Apoiou isenção:` → `Apoiou piso: N`), que é o que a interface exibe de verdade.
- **Diagnóstico permanente:** o teste do `axe` no dossiê agora imprime o **seletor, o HTML e o `failureSummary`** (cores + tamanho de fonte) de cada nó reprovado — a próxima quebra de contraste se explica sozinha no log.
- **Correção pedida em revisão visual (tema escuro):** os ícones dos 5 passos da linha do tempo usavam **`text-verde-mata`** (verde escuro fixo) sobre `bg-superficie` — no tema escuro o fundo também é escuro e os ícones ficavam **quase invisíveis**. Passaram a usar **`text-titulo`** (o token que adapta ao tema, o mesmo padrão dos cartões da régua). Para não repetir o erro, `tests/poderes.spec.ts` ganhou um teste que mede o **contraste real** do círculo em claro **e** escuro (`getComputedStyle` + luminância relativa; WCAG 1.4.11 exige 3:1) — esse tipo de regressão não passa mais batido (o `axe` não pega cor de ícone SVG).
- **Verificação:** `tests/poderes.spec.ts` passou de 7 para **14 casos** (régua com números e base legal · timeline na ordem, com CCJ, Casa revisora e derrubada do veto · contraste dos ícones nos dois temas · âncoras medidas por `getBoundingClientRect` · régua/timeline responsivas · atalhos contextuais PEC × lei). Revalidação do `/poderes` depois do fix: **22/22 verdes** (spec + as 8 checagens do `axe`, claro/escuro, incluindo o dossiê) e **suíte completa: 146/146 verdes (6,2 min)** — `npm run build` OK.

### Etapa 19 — Revisão de leitura e usabilidade (feedback do usuário) ✅
- **Manifesto no topo:** a frase *"Patriota de verdade não idolatra político; patriota de verdade fiscaliza os fatos para proteger a sua pátria."* subiu para o **começo**: hero da home (com atalho "Sobre nós") e logo abaixo do cabeçalho do **Sobre Nós** (antes ficava no fim da página). Marcada com `data-manifesto` para teste.
- **Rótulo único de navegação:** o item do menu, que já mudou para "Como Funciona" na Etapa 18, virou **"Entenda os 3 Poderes"** (mobile: "3 Poderes") — e o rodapé usa exatamente o mesmo texto. Antes eram três rótulos diferentes para a mesma página.
- **Rodapé único e condensado:** o que parecia "dois rodapés" (três blocos empilhados com linhas divisórias) virou **um bloco só**: declaração de isenção + links + compartilhar. Todas as frases de compliance continuam **no mesmo parágrafo** (exigência de `tests/seo.spec.ts`): "iniciativa cívica voluntária", "não possuímos vínculo com partidos políticos, candidatos ou órgãos estatais", "Lei de Acesso à Informação (Lei 12.527/2011)", "dadosabertos.camara.leg.br" e "Não há pedido de voto".
- **Sidebar no celular? Não — reordenação.** Medição real em 390×844 (`getBoundingClientRect` via script Playwright): o 1º card de deputado só aparecia **depois de 3,0 telas de rolagem** (y = 2504px), porque hemiciclo + gráfico por partido ocupavam **1419px** no topo. Sidebar não serve para 390px — e o conteúdo ali são **gráficos**, não navegação. Decisão: **ordem visual por CSS (`order-*`)**, com a lista subindo para **antes** dos gráficos no celular e a ordem original preservada no desktop (`md:order-none`). Resultado: 1º card em **2,1 telas** (y = 1777px) e os gráficos seguem logo abaixo do card da pauta no desktop.
- **Casa que não votou a matéria (a pergunta certa):** sim, dá para afirmar *por quê* com o dado que já temos — `pauta.senado.status` (curado em `scripts/fetch_senado.ts` contra a API oficial): `pendente` (o Senado ainda **não votou**), `simbolica` (aprovou sem painel eletrônico) e `nominal`. O novo `motivoSemVotoCasa()` traduz cada caso, e quando a casa filtrada tem **zero** votos a lista **não** despeja 81 cards de "Sem voto individual": aparece um estado vazio com o motivo real (`data-lista-vazia-casa`) e o botão **"👁️ Ver os 81 de qualquer forma"** (`data-ver-sem-voto`) para quem quiser conferir de perto. O aviso de "Votação parcial (73 de 81)" continua com a lista completa.
- **Paginação 20 em 20:** a lista mostra **20 cards** + botão **"⬇️ Carregar mais 20"** (`data-carregar-mais`), com contador honesto ("Mostrando 20 de 594 parlamentar(es)", `aria-live`). Qualquer mudança de pauta, busca, UF, cargo, ordenação ou filtro **reinicia a paginação**. Impacto medido: a home caiu de **144.573px para 7.778px** de documento (18× mais curta) e o primeiro paint ficou mais leve (20 cards em vez de 594).
- **Gráfico por partido com lista vazia:** o `GraficoPartidos` fazia `return null` quando não havia ninguém para plotar — agora mantém o bloco e mostra o estado vazio ("Nenhum voto individual nesta casa"), que é justamente a informação útil nesse caso.
- **Verificação:** helper **`carregarTodos()`** em `tests/helpers.ts` (clica "Carregar mais" até o fim, com trava de 80 cliques para não mascarar bug de paginação) usado pelos specs que conferem totais (cargo, filtros, ordenação, deep links, conformidade editorial) + `tests/casa-sem-voto.spec.ts` reescrito para o novo comportamento (lista vazia + motivo + reexibir → 81) + `PautaPills` ganhou `data-pautas-pills` (um teste contava **qualquer** `button[aria-pressed]`, e o botão do aviso entrou nessa conta — na prática, uma corrida com o fetch).

### Etapa 19.1 — Segunda rodada de leitura (cards, carrossel e textos) ✅
- **Ordem alfabética removida:** o seletor ficou com **4 opções** (divergentes, intercalado, favoráveis, mais votados) — menos ruído para quem só quer ver quem votou o quê. O `Ordem` do tipo, os rótulos, o banner e o ramo de ordenação foram apagados (sem código morto), e um teste garante que a opção não voltou.
- **Régua dos votos com conteúdo alinhado:** os 3 cards tinham blocos em alturas diferentes (título/ementa de tamanhos distintos empurravam a "regra" e os números). Agora título + exemplo vivem num bloco de altura mínima e as notas dos números foram encurtadas ("dos votos dos presentes"), então **regra, números e listas começam na mesma linha** nos três cards. A explicação do quórum mínimo da lei ordinária desceu para a lista de pontos (onde é lida em contexto).
- **Carrossel no celular (arrasta para o lado):** régua, os 3 Poderes, Câmara × Senado e a timeline deixaram de empilhar cards. No mobile viraram **trilhos horizontais** (`snap-x snap-mandatory` + cards de 82% da largura) com dica *"Arraste para o lado…"*; no desktop continuam grades idênticas às de antes (`md:`/`sm:` restaurando grid, inclusive a timeline, cujo trilho agora é horizontal no mobile em vez de vertical).
- **Botão "ver de qualquer forma" removido:** se a casa não votou, o aviso (com o motivo real) **já é a resposta** — não há mais caminho para listar centenas de cards vazios. O estado vazio aponta o caminho certo: "escolha a outra casa nas abas acima". O estado `mostrarSemVoto` foi removido do código.
- **"No dia a dia": exemplificação por pauta:** cada matéria ganhou uma frase curta e concreta do efeito prático (`EXEMPLOS_PRATICOS` + `exemploPratico()`), exibida no card da pauta na home e no dossiê (`data-exemplo-pratico`). Regra anti-desinformação: cada frase é tradução **direta da ementa oficial** — sem número, prazo ou efeito que não esteja na matéria. O título popular segue com impacto; o exemplo dá o "e daí?".
- **Verificação:** `tsc` e `lint` limpos; specs de poderes, ordenação, casa-sem-voto, cargo e home ajustados (o teste da régua passou a medir o carrossel por `scrollWidth`/`clientWidth` e o teste do cargo passou a esperar o **aviso** em vez de cards vazios).

### Etapa 20 — Simplificação: sem dossiê, sem nota; cartão de compartilhamento ✅
- **Decisão de produto:** o **dossiê** (modal com as 11 pautas, placar, filtros e carteirinha 9:16) saiu. No lugar, **um botão "Compartilhar" por card** que abre a **prévia da imagem** e oferece *Compartilhar* (menu do sistema no celular), *Baixar PNG* e *Copiar link*. Menos tela, mais viralidade.
- **A nota de "Alinhamento Cívico" saiu do produto** (era 0–100% no card). Saíram também a barra de %, a seção de fórmula em `/sobre#metodologia` (virou **"Como ler o voto"**, com o porquê de não ter nota), a linha da home que apontava a fórmula, o campo `pontuacaoCivica` do tipo/pipeline e a função `explicarPontuacao()`. A ordenação "divergentes/favoráveis" **nunca dependeu da nota** e segue idêntica.
- **A imagem (1080×1350, PNG 4:5)** — `ShareCard` — tem, nesta ordem: selo "Votação na Câmara/Senado" → **matéria (PEC/PL)** → **rótulo popular** → **"No dia a dia: …"** → **foto, nome, cargo • partido-UF** → **veredito factual colorido + "Voto registrado: SIM/NÃO"** (ou o motivo, quando não houve voto individual) → **fonte oficial** e o domínio do site.
- **`ShareModal`:** prévia + ações; no celular usa a **Web Share API com arquivo** (`canShare({ files })`), no desktop baixa o PNG e abre o WhatsApp com o texto factual + deep link. Fecha com ESC, X e clique fora (`role="dialog"`, `aria-modal`, `aria-labelledby`).
- **Regra do `.clinerules` preservada:** todo card passa a ter o **link da proposição oficial** (`data-fonte-card` → `camara.leg.br`), já que o dossiê era o único lugar com ele. O **motivo** do "sem voto individual" (votação simbólica/pendente) aparece no próprio card.
- **Deep links antigos continuam funcionando:** `?deputado=…&pauta=…` agora **filtra pela pessoa** e **destaca o card** (`data-focado`) com rolagem até ele (antes abria o dossiê).
- **Removidos:** `DossieModal.tsx`, `CitizenBadgeCard.tsx`, `CardPauta.tsx`, `explicarPontuacao`, `pontuacaoCivica` (tipo + pipeline) e os specs `dossie-carteirinha`/`pontuacao`.
- **Testes:** novo `tests/compartilhar.spec.ts` (prévia com nome/partido/matéria/voto, PNG válido, copiar link com deep link, fechar por ESC/X/clique fora, fonte oficial em cada card e deep link com destaque); `helpers.cards()` deixou de contar "Ver dossiê" e passou a usar `[data-nome]`; atualizados `acessibilidade` (axe no modal), `cargo`, `compartilhamento`, `conformidade-editorial` (card + modal), `deep-links`, `poderes`, `pauta-partido` e `responsividade`.

### Etapa 20.1 — Cartão compartilhável por bancada (partido) ✅
- **Pedido:** compartilhar o voto **por partido** (as 5 maiores já visíveis), com a mesma clareza do cartão do parlamentar.
- **Fonte única de dados:** novo `src/lib/partidos.ts` — `agregarPorPartido()` (contagem por alinhamento, total da bancada, `comVoto`) e `resumoPartido()` (manchete factual). O **`GraficoPartidos`** passou a usar esse helper (mesma ordenação e mesmos números de antes) e o cartão usa **exatamente** a mesma função — gráfico e imagem nunca divergem.
- **A manchete é factual e explícita:** `"40 de 44"` (sempre sobre quem **tinha voto individual**) + o rótulo do voto (`Apoiou isenção` / `Rejeitou blindagem` nas pautas invertidas). **Empate é empate** (não escolhe lado) e bancada **sem votação nominal** gera a mensagem honesta em vez de uma imagem vazia.
- **`ShareCardPartido` (1080×1350):** selo da casa → matéria + rótulo popular → **sigla grande + "N deputados/senadores" + o recorte** → **"X de N" + veredito** + "% de quem votou" → **barra empilhada** com a composição (Apoiou · Rejeitou · Abstenção · Ausente · Sem voto individual) → fonte oficial + domínio.
- **Recorte declarado:** o cartão mostra "Recorte: Congresso Nacional" (ou "Senado Federal · UF: SP · Busca: PL"), porque o gráfico respeita os filtros da tela — os números da imagem sempre batem com o que está à vista.
- **Onde fica o botão:** cada linha do gráfico ganhou um ícone de compartilhar (`data-compartilhar-partido="PL"`, `aria-label` completo). As **5 maiores** aparecem por padrão; em "ver todos os N partidos", todas ganham o botão.
- **Fluxo:** o **mesmo `ShareModal`** foi generalizado (`alvo` = parlamentar **ou** bancada) — prévia, **Compartilhar** (Web Share API com arquivo no celular; download + WhatsApp no desktop), **Baixar PNG** e **Copiar link**. O texto do Zap é factual: *"🚨 PL na Câmara: 40 de 44 (Apoiou isenção). Matéria: PEC 45/2019 — … Recorte: …"* + link `?pauta=…&busca=PL`.
- **Verificação:** unidade em `tests/partidos.spec.ts` (contagem, desempate, "3 de 4" = 75%, empate, bancada sem voto) + `tests/compartilhar-partido.spec.ts` (5 botões por padrão, prévia com partido/matéria/contagem/recorte, PNG válido, copiar link, cabe em 360px, bancada sem votação nominal) + `axe` no modal da bancada (claro/escuro).

### Verificação factual — PEC 221/2019 (fim da escala 6x1) ✅
- **Dúvida levantada:** "não é 40 horas?" — conferido **na fonte oficial** (API de Dados Abertos da Câmara, `proposicoes?siglaTipo=PEC&numero=221&ano=2019`, em 17/10/2026).
- **Ementa literal:** *"Altera o Art. 7º inciso XII da constituição Federal, **reduzindo a jornada de trabalho a 36 horas semanais em 10 anos**."* → o dado do app estava **correto** (36h, e não 40h). As 40h que circulam vêm da **jornada de 40h do setor público** / de outras propostas — não desta matéria.
- **Rótulo ajustado para ficar auto-explicativo:** "Fim da escala 6x1 (36h em 10 anos)" — deixa claro que é uma **redução gradual**, não um limite imediato (o texto oficial diz "em 10 anos").
- **Guarda permanente:** `tests/api-dados.spec.ts` passou a travar a ementa (36h semanais + em 10 anos) e o rótulo — se alguém "arredondar" o dado no futuro, o teste quebra.
- **Achado de atualização (pendente de decisão):** a mesma API informa situação **"Transformado em Norma Jurídica"** em **16/10/2026**, enquanto o nosso JSON (verificado em 12/10/2026) ainda diz **"Senado: pendente"** para essa pauta. Ou seja, o dado do app está **4 dias atrasado** para essa matéria — recomenda-se rodar `npm run update-data` (o pipeline revalida Câmara/Senado/TSE) e revisar os testes que assumem "0 senadores votaram" nessa pauta.

### Verificação factual — PEC 221/2019 x PEC 8/2025 (escala 6x1) ✅
- **Dúvida levantada:** "a PEC do 6x1 não é a PEC 8/2025?" — conferido **na fonte oficial** (API de Dados Abertos da Câmara + tramitações, em 17/10/2026).
- **São duas matérias diferentes, com relação entre elas:**
  - **PEC 221/2019** (a do **6x1**, que auditamos): *"reduzindo a jornada de trabalho a 36 horas semanais em 10 anos"*. Aprovada no Plenário da Câmara em **27/05/2026** (472 × 22) e **promulgada como Emenda Constitucional 141/2026** (DOU de **16/10/2026**).
  - **PEC 8/2025**: *"redução da jornada de trabalho para **quatro dias por semana**"* — matéria **distinta** (semana de 4 dias, não o fim do 6x1). Foi **apensada à PEC 221/2019** em 09/02/2026 e, com a aprovação da principal, ficou **prejudicada** (art. 191 do RICD) e **arquivada** em 27/05/2026.
- **Conclusão:** o app está auditando a matéria certa (**PEC 221/2019 → EC 141/2026**). A confusão é natural porque a 8/2025 corria **apensada** a ela.
- **Pendência de dados (resolvida na Etapa 21):** o JSON dizia "Senado: pendente" para a 221/2019, quando a matéria já tinha virado **EC 141/2026** (16/10/2026). A Etapa 21 rodou o pipeline e gravou os votos definitivos.

### Etapa 21 — Escala 6x1 promulgada: dados definitivos + card "O que foi aprovado?" ✅
- **Fonte conferida antes de escrever** (17/10/2026): texto integral da **EC 141/2026** no Planalto, matéria **174386** no Senado e APIs das duas Casas. Nada foi parafraseado "de memória".
- **Dados da pauta (`src/lib/pautas.ts`)** — `fim_escala_6x1`:
  - título **"Fim da Escala 6x1 / Jornada 5x2"**; ementa = a da **EC 141/2026**; `materia` segue **PEC 221/2019**;
  - `status: PROMULGADA`, `normaOficial: Emenda Constitucional 141/2026`, `dataPromulgacao: 2026-10-16`, link da norma no Planalto;
  - **Câmara**: votação-chave passou do 1º para o **2º turno** (`2233802-438`, 27/05/2026 — **461 SIM × 19 NÃO**);
  - **Senado**: `7107` (14/10/2026, **2º turno** — **75 SIM × 1 NÃO**; 1º turno idêntico), `status: nominal`;
  - `resultadoCamara`, `resultadoSenado`, `resumoFactual` e **4 pontos explicativos** (40h × 36h, cronograma 42h/40h, garantia salarial, apensamento da PEC 8/2025) + **ressalva** (regimes diferenciados, art. 7º §2º/§3º e art. 8º).
- **Pipeline reexecutado:** `fetch-senado` (81 senadores; 75 SIM × 1 NÃO × 5 sem voto registrado) e `update-data` (Câmara: 452 × 18 entre os 513 em exercício).
- **Lista nominal:** na aba **Senadores**, o único contrário (**Hamilton Mourão, REPUBLICANOS-RS**) abre a lista na ordem padrão; na Câmara, os 18 contrários aparecem com os mais votados no topo.
- **Contagem honesta:** as abas passaram a contar **voto registrado** (Sim/Não/Abstenção) — `AUSENTE` não infla mais o "votaram". Ex.: 6x1 no Senado = **76 de 81** (não 81); Cesta Básica no Senado = **70 de 81**.
- **Card "O que foi aprovado?"** (`PautaDetalheModal`): selo **PROMULGADA em 16/10/2026**, norma, resumo, **placares oficiais** das duas Casas (com a nota de que o painel inclui quem deixou o mandato), os 4 pontos com ícones, a ressalva e o link para ler a EC no Planalto. Abre pelo botão no card da matéria (só existe em pauta com texto verificado), fecha por ESC, X ou clique fora.
- **Verificação:** `tests/escala-6x1.spec.ts` (4 casos: JSON 75/1/5, aba com 76 votaram e Mourão no topo, conteúdo do modal, fechamento/ausência em pauta sem texto) + `api-dados` (guarda factual da EC: ementa, datas, placares e 4 pontos) + **axe no modal em claro e escuro** (0 violações críticas/sérias). `tsc` e `lint` limpos.
- ⚠️ **Placar oficial × lista em exercício:** o painel da sessão (461×19) inclui parlamentares que já deixaram o mandato; a lista mostra os **513 em exercício** (452×18). O modal declara isso explicitamente para a soma menor não parecer erro.

## Decisões-chave (registro)
1. **Pautas:** as 7 do PRD, com IDs reais e **curadoria manual** da votação-chave.
2. **Inversão semântica** centralizada (`aplicarInversao`) — Blindagem: **NÃO = pró-cidadão**.
3. **Anti-desinformação:** só API oficial, link oficial em cada card, **zero mock**.
4. **Zero database em runtime:** JSON estático + fotos locais.
5. **Acessibilidade:** contraste AA (claro e escuro); `axe` sem violações críticas/sérias.
6. **Paleta cívica** do PRD como fonte única de verdade.

## Próximos passos (backlog)
1. **Deploy** estático (Vercel/Cloudflare Pages) + domínio, CDN e cache.
2. **Melhorar o casamento do TSE** (hoje 453/513 deputados e 55/81 senadores): cruzar também por `SQ_CANDIDATO`/nome civil abreviado.
3. **Otimização das fotos** (WebP 150×150) para reduzir `public/fotos` (~20 MB).
4. **OG image dinâmica** (gerada por parlamentar, além da estática atual) e "Kit por estado".
5. (Opcional) tema com 3 estados (claro / escuro / sistema).

---


## Apêndice A — histórico técnico detalhado (por fase)

> Documento de trabalho gerado a partir da leitura de `.clinerules` e dos documentos
> `docs/01_prd_visao_geral.md`, `docs/02_arquitetura_e_infra.md` e `docs/03_roadmap_e_codigo_base.md`.
> **Os três documentos originais são preservados intactos.**

## 0. Contexto
- **Produto:** plataforma cívica de transparência/auditoria de votações nominais da Câmara dos Deputados.
- **Princípios inegociáveis:** linguagem popular; custo zero (Zero Database em Runtime); tolerância zero a desinformação (só API oficial `dadosabertos.camara.leg.br`, com link oficial por card); inversão semântica respeitada; estética cívica sem viés partidário.

## 1. Decisões travadas
| Tema | Definição |
|---|---|
| Fonte canônica das pautas | As **7 pautas de impacto social do PRD**, com IDs reais da API |
| Paleta | A do **PRD**: Verde Mata `#0F2F1D`, Verde Bandeira `#1B4D3E`, Dourado Cívico `#D9A726`, Fundo Neutro `#F8FAF9` |
| `.clinerules` | **Atualizado** para a paleta do PRD (fonte única de verdade) |
| Fallback mock | **Removido** (nada de dados fictícios) |

## 2. Mapa de matérias → IDs da API oficial (verificado)
| # | Pauta popular | Matéria | `id` proposição | `invertida` |
|---|---|---|---|---|
| 1 | Isenção da Cesta Básica | PEC 45/2019 (Reforma Tributária) — *curadoria manual* | `2196833` (original) / `2403910` (texto final) | `false` |
| 2 | Igualdade Salarial H/M | PL 1085/2023 | `2351179` | `false` |
| 3 | **Fim da Blindagem** | PEC 3/2021 | `2270800` | **`true`** |
| 4 | IR até 2 salários mínimos | PL 81/2024 | `2417025` | `false` |
| 5 | Taxação dos Super-Ricos | PL 4173/2023 | `2383287` | `false` |
| 6 | Teto do juro do cartão | PL 2685/2022 (Desenrola) | `2336393` | `false` |
| 7 | Piso da Enfermagem | PL 2564/2020 | `2309349` | `false` |

> ⚠️ O PRD cita "PL 2384/2023" para a cesta básica, mas na API essa matéria é o **CARF** (`id 2360503`).
> A isenção da cesta básica decorre da **PEC 45/2019** (base da EC 132/2023) — usar essa matéria.

### Notas técnicas da API (confirmadas)
- A API v2 devolve **XML por padrão** → sempre enviar header `Accept: application/json`.
- Descoberta de votações: `GET /proposicoes/{id}/votacoes`. O filtro `/votacoes?idProposicao=` **não funciona**.
- IDs de votação têm formato `{idProposicao}-{seq}` (ex.: Blindagem → `2270800-160` 2º turno).
- Votos nominais: `GET /votacoes/{idVotacao}/votos`.

## 3. Regra de inversão semântica
Uma única função central aplica o mapeamento:
- `invertida = false`: `SIM → FAVORAVEL`, `NÃO → CONTRA`.
- `invertida = true`: `SIM → CONTRA`, `NÃO → FAVORAVEL` (**caso da PEC da Blindagem: NÃO = fim da blindagem**).
- `ABSTENÇÃO → ABSTENCAO`; ausência/obstrução → `AUSENTE`.
A votação-chave de cada pauta é **curada à mão** (evita confundir texto-base com destaque e inverter o significado).

## 4. Estratégia de inicialização do Next.js
`create-next-app` **recusa** iniciar numa pasta com `.clinerules` (não está na whitelist oficial;
`docs` está). Por isso:
1. Gerar o scaffold numa subpasta temporária `.scaffold/` com `--skip-install`.
2. Mover o conteúdo gerado para a raiz (merge — sem colisão com `docs/` ou `.clinerules`).
3. Remover `.scaffold/`.
4. Instalar dependências na raiz.

## 5. Estrutura final
```
Fiscal_Patria/
├── .clinerules                 # preservado (só a linha da paleta muda)
├── docs/                       # PRESERVADO (3 .docx + este plano)
├── public/data/parlamentares.json
├── scripts/fetch_votes.ts
├── src/app/{layout.tsx,page.tsx,globals.css}
├── src/components/CitizenBadgeCard.tsx
├── src/types/parlamentar.ts
├── src/lib/pautas.ts
├── package.json / tsconfig.json / next.config.ts / postcss.config.mjs
```

## 6. Dependências
- Runtime: `lucide-react`, `html-to-image`, `canvas-confetti`
- Dev: `tsx`, `@types/canvas-confetti`

## 7. Fases
1. **Setup** — scaffold Next.js (App Router+TS+Tailwind+ESLint), deps, pastas, paleta, script `update-data`.
2. **Pipeline de Dados** — `src/lib/pautas.ts` (7 pautas + `invertida`), descoberta via `/proposicoes/{id}/votacoes`, coleta de votos nominais, inversão, geração de `public/data/parlamentares.json`. **Sem mock**: falha de API não sobrescreve o JSON bom.
3. **UI + Carteirinha/Selo** — layout cívico, home (hemiciclo, pills, busca+UF, modal dossiê com link `camara.leg.br`), `CitizenBadgeCard` 9:16 (`html-to-image` + `canvas-confetti`).
4. **Validação de Build** — `tsc --noEmit`, `lint`, `build`; checar SSG, carga do JSON e links oficiais.

## 8. Riscos mapeados
- Votação-chave errada numa pauta invertida → card mente (mitigação: curadoria manual).
- Importar tipos de `scripts/` no cliente puxaria `fs`/`path` → tipos em `src/types/`.
- `html-to-image` + fotos remotas (CORS) → `crossOrigin`/data URL.
- Fotos remotas → `images.remotePatterns` ou `<img>`.
- Tailwind v4 (`@theme`) — sem `tailwind.config`.

## 9. Correções ao material fornecido
- `create-next-js-app` → correto é **`create-next-app`**.
- Paleta do `.clinerules` (`#064e3b`/`#eab308`) atualizada → paleta do PRD.

## 10. Status de execução
### Fase 1 — Setup: CONCLUÍDA ✅
- **Stack:** Next.js 16.4.0 (App Router, Turbopack) + React 19 + TypeScript + ESLint + Tailwind CSS v4.
- Tailwind v4 configurado pelo caminho oficial: `@tailwindcss/postcss` + `postcss.config.mjs` (removeu-se o bloco `turbopack` do `next.config.ts`).
- **Build:** `npm run build` OK (4 páginas estáticas). **Lint:** `npm run lint` OK (exit 0).
- **Estrutura criada:** `public/data/`, `scripts/`, `src/components/`, `src/types/`, `src/lib/`.
- **Paleta cívica** aplicada em `src/app/globals.css` (`--color-verde-mata/verde-bandeira/dourado/fundo-neutro`); `.clinerules` atualizado.
- Script `update-data` adicionado ao `package.json`.
- **Preservado:** `docs/` (3 originais intactos) e `.clinerules`.
- ⚠️ **Nota de ambiente:** no primeiro install, os binários nativos `@next/swc-win32-x64-msvc` e `lightningcss-win32-x64-msvc` vieram **truncados** (6,4 MB / 6 MB). Corrigido com reinstalação limpa (110 MB / 9,5 MB) — nativos carregam normalmente.
- ⚠️ `@tailwindcss/turbopack` permanece como devDependency (herdado do scaffold), hoje não utilizado.

### Fase 2 — Pipeline de Dados: CONCLUÍDA ✅
- Criados: `src/types/parlamentar.ts`, `src/lib/pautas.ts` (7 pautas + regra única de inversão), `scripts/fetch_votes.ts`.
- `npm run update-data` → **751 parlamentares** em `public/data/parlamentares.json` (≈967 KB, UTF-8).
- Reconciliação validada (contagens batem com as descrições oficiais) e inversão da Blindagem checada (NÃO→FAVORAVEL, **0 inconsistências**).
- Curadoria: IR trocado para **PL 1087/2025** (o PL 81/2024 não teve voto nominal de mérito); teto do cartão em **2336393-56** ("Mantido o texto").
- `npm run build` (Turbopack) OK, incluindo type-check do `scripts/`.
- Endpoint de votos: `GET /votacoes/{id}/votos` **sem** params (o parâmetro `itens` retorna HTTP 400).
### Fase 3 — UI + Carteirinha/Selo: CONCLUÍDA ✅
- Componentes criados: `SiteHeader`, `Hemiciclo`, `PautaPills`, `BuscaFiltros`, `ParlamentarCard`, `DossieModal`, `CitizenBadgeCard`; `src/app/page.tsx` reescrito (client).
- `layout.tsx` com metadata/OG cívicos (pt-BR); `next.config.ts` com `images.remotePatterns` para `www.camara.leg.br`.
- Fotos via `next/image` (`unoptimized`, sem dependência de servidor). O card exportável usa **avatar com iniciais** porque as fotos da Câmara **não enviam CORS** (evita "taint" do canvas no `html-to-image`).
- Links oficiais em todos os cards (perfil + proposição). Export 9:16 + `canvas-confetti`.
- `npm run build` OK (type-check) e `npm run lint` OK (exit 0); servidor de produção responde 200.

### Fase 4 — Validação final: CONCLUÍDA ✅
- **Etapa 1 — Código:** `npm run lint` (exit 0) e `npm run build` (type-check) OK.
- **Etapa 2 — Dados:** 751 deputados, ids únicos, score 0–100, inversão da Blindagem com **0 inconsistências**, 751 fotos locais (0 ausentes), 751 links de perfil corretos.
- **Etapa 3 — Links oficiais:** 7 proposições e perfis de deputado → HTTP **200**.
- **Etapa 4 — Runtime:** `/`, `/data/parlamentares.json` e `/fotos/{id}.jpg` → **200**.
- **Densificação:** matriz 751×7 com `AUSENTE` explícito (0 chaves faltantes; 5257 entradas).
- **Etapa 5 — Reprodutibilidade:** `npm run update-all` executado 2× → SHA-256 **idêntico** (`76146A65…`) — prova de determinismo.
- `README.md` atualizado com instruções.

---

## 11. Plano detalhado — Fase 2 (Pipeline de Dados da Câmara)

### 11.1 Arquivos a criar
- `src/types/parlamentar.ts` — contratos compartilhados (evita importar de `scripts/`).
- `src/lib/pautas.ts` — config das 7 pautas + função única `aplicarInversao()`.
- `scripts/fetch_votes.ts` — pipeline Node (executado com `tsx`).
- `public/data/parlamentares.json` — saída consolidada.

### 11.2 Votações-chave (curadoria manual — anti-erro de destaque)
| # | Pauta | Matéria | idProposicao | votacaoId (chave) | invertida |
|---|---|---|---|---|---|
| 1 | Cesta Básica | PEC 45/2019 | 2196833 | `2196833-373` (2º turno) | false |
| 2 | Igualdade Salarial | PL 1085/2023 | 2351179 | `2351179-51` (Subem. Substitutiva) | false |
| 3 | **Fim da Blindagem** | PEC 3/2021 | 2270800 | `2270800-160` (2º turno) | **true** |
| 4 | Salário livre de IR | PL 1087/2025 | 2487436 | `2487436-169` (Subem. Substitutiva) | false |
| 5 | Super-Ricos | PL 4173/2023 | 2383287 | `2383287-43` (Subem. Substitutiva) | false |
| 6 | Teto juro do cartão | PL 2685/2022 | 2336393 | `2336393-56` (Mantido o texto) | false |
| 7 | Piso da Enfermagem | PL 2564/2020 | 2309349 | `2309349-146` (Aprovado o PL) | false |

> Links oficiais: proposição → `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao={id}`;
> deputado → `https://www.camara.leg.br/deputados/{id}`; foto → `.../internet/deputado/bandep/{id}.jpg`.

### 11.3 Etapas do pipeline
1. Para cada pauta: `GET /votacoes/{votacaoId}/votos` (header `Accept: application/json`), **paginando** via `links.next`.
2. Agregar deputados por `id` (nome, partido, UF, foto, email).
3. Aplicar a **regra única de inversão** (SIM/NÃO → FAVORAVEL/CONTRA conforme `invertida`).
4. Calcular `scoreCidadao` = `round((FAVORAVEL*1 + ABSTENCAO*0.3) / 7 * 100)`.
5. Ordenar (score desc, nome asc) e escrever o JSON.
6. **Reconciliação**: comparar contagem SIM/NÃO calculada com o total do campo `descricao` da votação.
7. **Densificação**: todo parlamentar recebe as 7 pautas com `AUSENTE` explícito quando não consta na votação (JSON autodescritivo, sem chaves faltantes).

### 11.4 Regras anti-desinformação (inegociável)
- **Zero mock**: se qualquer fetch falhar, o script **aborta** (exit 1) e **NÃO sobrescreve** o JSON existente.
- Sem chamadas à API em runtime no cliente (JSON estático).

### 11.5 Edge cases tratados
- Paginação do endpoint de votos; `itens` alto + follow `next`.
- `tipoVoto`: `Sim`, `Não`, `Abstenção`, `Obstrução`, `Artigo 17` → mapeados (Obstrução/Art.17 → `AUSENTE`).
- Deputado ausente em uma votação → `AUSENTE` nessa pauta.
- Retry com backoff em 429/5xx; pequena pausa entre requisições.

### 11.6 Execução
`npm run update-data` → gera `public/data/parlamentares.json`.

---

## 12. Plano detalhado — Fase 3 (UI + Carteirinha/Selo)

### 12.1 Arquivos
| Arquivo | Ação | Papel |
|---|---|---|
| `next.config.ts` | editar | `images.remotePatterns` para `www.camara.leg.br` (fotos oficiais) |
| `src/app/layout.tsx` | editar | Metadata cívica (title/description/OG, `lang="pt-BR"`) |
| `src/app/page.tsx` | reescrever | Home (client): carrega JSON, filtros, carrossel, hemiciclo, grid, modal |
| `src/lib/parlamentares.ts` | criar | Helpers: labels/cores de alinhamento, distribuição por pauta, normalização de busca |
| `src/components/SiteHeader.tsx` | criar | Marca + contador cívico + selo "Painel atualizado" |
| `src/components/Hemiciclo.tsx` | criar | Mini-hemiciclo (SVG) colorido pela pauta selecionada |
| `src/components/PautaPills.tsx` | criar | Carrossel horizontal das 7 pautas (troca de contexto) |
| `src/components/BuscaFiltros.tsx` | criar | Busca por nome/partido + filtro UF |
| `src/components/ParlamentarCard.tsx` | criar | Card do grid (foto, partido/UF, barra de score) |
| `src/components/DossieModal.tsx` | criar | Modal: matriz das 7 pautas + link oficial + carteirinha |
| `src/components/CitizenBadgeCard.tsx` | criar | Card 9:16 (1080×1920) exportável + confetti |

### 12.2 Fluxo de dados
`page.tsx` (`'use client'`) → `useEffect` faz `fetch('/data/parlamentares.json')` (Zero DB em runtime).
Estados: `pautaSel` (slug), `busca`, `ufSel`, `dossie`.
Derivados: `distribuicao` (contagem FAVORAVEL/CONTRA/ABSTENCAO/AUSENTE da pauta) → Hemiciclo;
`filtrados` (nome/partido/UF) → grid.

### 12.3 Aparência (paleta cívica)
- FAVORAVEL → verde (`--color-verde-mata`/`verde-bandeira`); CONTRA → vermelho contido; ABSTENCAO/AUSENTE → cinza neutro. Fundo `#F8FAF9`; destaques em dourado (`#D9A726`). Sem estética partidária.
- Todos os cards/telas usam as fontes Geist já configuradas.

### 12.4 Hemiciclo
Semiproporcional: ~513 assentos posicionados em semicírculo (SVG), coloridos pela **proporção** de votos da pauta selecionada (o dataset tem 751 deputados de legislaturas distintas; o hemiciclo ilustra o Plenário). Legenda com contagens.

### 12.5 Carteirinha/Selo (export)
- `html-to-image` → `toPng(ref, { canvasWidth: 1080, canvasHeight: 1920 })`; download por `<a download>`.
- `canvas-confetti` disparado ao exportar.
- **Anti-CORS:** foto renderizada via `next/image` (URL `/_next/image?...`, *same-origin*) → evita "taint" do canvas. Fallback: erro tratado sem quebrar a UI.
- Conteúdo: selo "Fiscal da Pátria", foto, nome, partido/UF, score, resumo das 7 pautas, link oficial e "Audite você também".

### 12.6 Metadata / OpenGraph
`layout.tsx`: `title`, `description`, `openGraph` (pt_BR, type website) e `metadataBase`. Imagem OG dinâmica por deputado fica para iteração futura.

### 12.7 Riscos e mitigação
- CORS no export → `next/image` same-origin (acima).
- ESLint core-web-vitals exige `next/image` (não `<img>`).
- Volume de dados (751 KB) → filtragem em memória, sem re-fetch.
- Acessibilidade: foco no modal, `aria-label`, fechar com `Esc`.

### 12.8 Validação
`npm run lint` + `npm run build` (type-check) e teste do export do card.

### 12.9 Fora do escopo desta fase
Imagem OG dinâmica por deputado, Kit por estado, export 9:16 adicionais e deploy (Fase 4+).

---

## 13. Pipeline de fotos oficiais (pré-Fase 4)

Objetivo: trazer as fotos oficiais para **arquivos locais** (`public/fotos/`), resolvendo o limite de CORS e permitindo a foto real no card exportável.

### 13.1 Novo script `scripts/fetch_fotos.ts`
- Lê `public/data/parlamentares.json`.
- Baixa `https://www.camara.leg.br/internet/deputado/bandep/{id}.jpg` → `public/fotos/{id}.jpg`.
  - Conc **concorrência limitada** (ex.: 8) + retry/backoff; **pula** arquivos já existentes.
  - Falha de um arquivo **não** derruba o processo (apenas contabiliza).
- Nos que baixarem com sucesso, reescreve `foto` para `"/fotos/{id}.jpg"` (local, *same-origin*);
  nos que falharem, **mantém** a URL oficial (fallback).

### 13.2 `package.json`
- `"fetch-fotos": "tsx scripts/fetch_fotos.ts"`
- `"update-all": "npm run update-data && npm run fetch-fotos"`

### 13.3 Impacto na UI
- `CitizenBadgeCard`: se `foto` for local (`/fotos/...`) → **embute a foto oficial** no card
  (same-origin, sem "taint" do canvas). Se não → avatar com iniciais (fallback).
- `ParlamentarCard`/`DossieModal`: `next/image` (`unoptimized`) exibindo a foto local.

### 13.4 Observações
- Volume estimado: ~751 JPEGs (~23 KB cada ≈ ~17 MB em `public/fotos/`).
- Otimização para WebP 150×150 (Sharp) fica como melhoria futura (doc 02), sem depender de binários nativos agora.

### 13.5 Depois
Seguir para a **Fase 4 — Validação final** (revisão de `update-all`, lint, build, links oficiais e integridade dos dados).

### 13.6 Status: CONCLUÍDO ✅
- `scripts/fetch_fotos.ts` criado; scripts `fetch-fotos` e `update-all` adicionados ao `package.json`.
- `npm run fetch-fotos` → **751/751** fotos locais em `public/fotos/` (~18,4 MB); campo `foto` reescrito para `/fotos/{id}.jpg` (0 remotas restantes).
- `CitizenBadgeCard` embute a **foto oficial** (same-origin) quando local; senão usa iniciais.
- `npm run build` OK (type-check) e `npm run lint` OK (exit 0); `/fotos/74646.jpg` servido com **200** (`image/jpeg`).

---

## 14. Página institucional — "Sobre Nós / Manifesto Cívico"

Fonte do texto: `docs/04_sobre_nos_manifesto.md` (extraído do `.docx`).

### 14.1 Arquivos
- `src/components/SiteFooter.tsx` (**novo**) — rodapé reutilizável com o link "Manifesto Cívico & Transparência" → `/sobre`.
- `src/components/SiteHeader.tsx` — link "Sobre o Projeto" (rótulo curto "Sobre" no mobile); logo virou link para `/`.
- `src/app/sobre/page.tsx` (**novo**) — página do manifesto (server component, `max-w-3xl`, mobile-first).
- `src/app/page.tsx` — rodapé inline substituído por `<SiteFooter />`.

### 14.2 Estrutura (fiel ao doc 04)
1. "← Voltar para a fiscalização" (topo e base) → `/`.
2. Hero "Sobre Nós" + missão.
3. Seção 1 — Apenas Fatos, Zero Opinião.
4. Seção 2 — Por que não temos campo de comentários? (card em evidência).
5. Seção 3 — O Nosso Único Pedido (destaque máximo).
6. Seção 4 — Compromissos de Transparência (grid 3 pilares).
7. Citação final.

### 14.3 Restrições respeitadas
Sem comentários, formulários de contato ou caixas de debate. Mobile-first (a maioria acessa via WhatsApp). Paleta cívica + ícones Lucide (`ShieldCheck`, `Scale`, `AlertCircle`, `HeartHandshake`, `ExternalLink`).

### 14.4 Validação
`npm run lint` (exit 0) e `npm run build` OK — `/sobre` gerada como estática; `GET /sobre` → **200** com o conteúdo esperado; `/` mantém os links para `/sobre`.

---

## 15. Validação de Front-end (Playwright)

- Ferramenta: **`@playwright/test`** usando o **Chrome instalado** (`channel: "chrome"`); `webServer` sobe o `npm run dev`.
- Arquivos: `playwright.config.ts` + `tests/*.spec.ts` (8 specs) + `tests/helpers.ts`; script **`npm run test:e2e`**.
- Cobertura — **39 testes** em 8 arquivos (todos verdes):
  1. **home.spec** (8): título/hero, header, base completa (**751**) + contador, cards com foto/alinhamento, hemiciclo com legenda, 7 pills, filtros (28 UFs), rodapé.
  2. **filtros.spec** (6): busca por nome (sem acento) e por partido, resultado vazio, limpar, UF=SP (exclui outras UFs), combinação busca+UF.
  3. **pautas-hemiciclo.spec** (4): alternância das 7 pautas (só uma ativa), card com link oficial, troca de matéria, hemiciclo atualiza as contagens.
  4. **dossie-carteirinha.spec** (6): matriz das 7 pautas, 7 links oficiais + perfil oficial, fechar (ESC/X/overlay), conteúdo do selo e **export PNG válido** (assinatura 89 50 4E 47 + tamanho).
  5. **sobre.spec** (5): todas as seções, botões de voltar, link `camara.leg.br`, navegação home↔sobre e via rodapé.
  6. **api-dados.spec** (4): JSON íntegro (751, 7 slugs, links/fotos), **inversão da Blindagem**, foto local servida, 404.
  7. **acessibilidade.spec** (2): **axe** em `/` e `/sobre` — 0 violações críticas/sérias.
  8. **responsividade.spec** (4): mobile 390×844 — header curto, coluna única, dossiê/carteirinha, sobre.
- **Bugs encontrados e corrigidos:**
  - *hydration mismatch* no `Hemiciclo` (coordenadas `cx/cy` divergiam na última casa decimal entre Node e Chrome) → arredondadas com `toFixed(3)`.
  - *contraste de cor* (axe, 755 nós na home): textos secundários com opacidade `/60` e `/70` não atingiam 4,5:1 → elevados para `/80` (~5,4:1); violações zeradas.
---

## 16. Compartilhamento Dark Social (WhatsApp)

- **Componente:** `src/components/WhatsAppShareButton.tsx` (reutilizável).
  - Mensagem oficial com `encodeURIComponent` → `https://api.whatsapp.com/send?text=...`; abre em nova aba (`target="_blank" rel="noopener noreferrer"`).
  - Estilo: `bg-[#25D366] hover:bg-[#20ba59]`, texto branco, `rounded-xl`, sombra sutil e transição; ícone `Send` (Lucide).
- **Pontos de compartilhamento:**
  1. **Home (hero):** botão em destaque ao lado dos filtros.
  2. **Rodapé (home e `/sobre`):** CTA "Ajude a espalhar a verdade: compartilhe com sua família e amigos" + botão "🇧🇷 Compartilhar no Zap".
  3. **Dossiê do deputado:** botão com mensagem focada e **deep link** `?deputado=<id>`.
- **Deep links:** `/?deputado=<id>` abre o dossiê do deputado; `/?pauta=<slug>` pré-seleciona a pauta.
- **Testes:** `tests/compartilhamento.spec.ts` (7) — mensagem oficial exata, posicionamentos, deep links e mobile. **Suíte total: 48 testes verdes.**

---

## 17. Dark Mode real + SocialShareBar unificada

### 17.1 Dark mode real
- `globals.css`: `@custom-variant dark (&:where(.dark, .dark *))` + tokens semânticos (`--background`, `--superficie`, `--titulo`, `--corpo`, `--corpo-fraco`, `--borda`, `--trilha`) com override em `.dark`.
- `layout.tsx`: script **anti-flash** (aplica o tema antes do paint) + `suppressHydrationWarning`.
- `ThemeToggle.tsx`: alterna a classe `.dark`, persiste em `localStorage` (`fiscal-tema`) e respeita `prefers-color-scheme`; ícones Sol/Lua por CSS (sem estado).
- Componentes migrados para tokens semânticos (fundo, superfície, bordas, textos). A `CitizenBadgeCard` mantém a identidade verde-mata nos dois temas (é a "carteirinha" da marca).

### 17.2 SocialShareBar (unificada)
- `src/lib/share.ts`: `SITE_URL`, `MENSAGEM_OFICIAL`, `TEXTO_X`, `urlWhatsApp`, `urlTelegram`, `urlX`, `urlDeputado`, `mensagemDeputado`.
- `SocialShareBar.tsx`: **WhatsApp (prioritário)** · **Telegram** · **X (Twitter)** · **Copiar Link** (feedback 2s "Copiado! ✓") · **Mais opções** (Web Share API detectada via `useSyncExternalStore`).
- Aplicada no **rodapé** (home e `/sobre`), no **corpo de `/sobre`** e no **modal do parlamentar** (deep link `?deputado=`).

### 17.3 Contraste AA (claro e escuro)
- WhatsApp: texto `#052e16` sobre `#25D366` (**7,3:1**) · Telegram: `#0077b5` + branco (**4,88:1**) · X: preto + branco (**21:1**) · Copiar: slate-800 + branco (**14,6:1**) · Web Share: verde-mata + branco (**14,5:1**).
- Chips de voto: texto branco nos estados escuros e `#0f2f1d` no `AUSENTE` (fundo claro).
- O diálogo do dossiê ganhou **nome acessível** (`aria-label`).

### 17.4 Testes
- `tests/tema.spec.ts` (4): alternância + persistência, **anti-flash**, preferência do sistema e teclado.
- `tests/acessibilidade.spec.ts`: axe em **claro e escuro** (`/` e `/sobre`) + **dossiê aberto**, sem exceções.
- `tests/compartilhamento.spec.ts` (10): WhatsApp/Telegram/X/Copiar/Web Share, deep links e mobile.
- **Suíte total: 57 testes.**

